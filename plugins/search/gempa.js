import { getLatestGempa, getGempaList } from '../../src/scrapers/search/gempa.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'gempa',
  alias: ['earthquake'],
  category: 'search',
  description: { id: 'Info gempa terbaru dari BMKG, arg list untuk 5 terakhir', en: 'Latest earthquake info from BMKG, arg list for the last 5' },
  usage: '.gempa atau .gempa list',
  example: '.gempa list',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    gempa: {
      failed: 'Mouu, data gempa BMKG lagi nggak bisa diambil: {message}. Coba lagi nanti ya~',
      notFound: 'Mouu, data gempanya kosong dari BMKG. Coba lagi nanti ya~',
      header: 'Gempa terbaru (BMKG)',
      line: '{label}: {value}',
      dateLabel: 'Waktu',
      magLabel: 'Magnitudo',
      depthLabel: 'Kedalaman',
      regionLabel: 'Wilayah',
      feltLabel: 'Dirasakan',
      caption: 'Peta guncangan gempa {mag} di {region}',
      listHeader: '5 gempa terakhir (BMKG):',
      listItem: '{n}. M{mag}, {depth}, {date} {time}\n{region}',
      btnList: 'Lihat 5 terakhir',
      btnLatest: 'Gempa terbaru',
    },
  },
  en: {
    gempa: {
      failed: 'Mouu, BMKG earthquake data cannot be fetched: {message}. Try again later~',
      notFound: 'Mouu, the earthquake data from BMKG is empty. Try again later~',
      header: 'Latest earthquake (BMKG)',
      line: '{label}: {value}',
      dateLabel: 'Time',
      magLabel: 'Magnitude',
      depthLabel: 'Depth',
      regionLabel: 'Region',
      feltLabel: 'Felt',
      caption: 'Shakemap of the {mag} quake in {region}',
      listHeader: 'Last 5 earthquakes (BMKG):',
      listItem: '{n}. M{mag}, {depth}, {date} {time}\n{region}',
      btnList: 'See last 5',
      btnLatest: 'Latest quake',
    },
  },
}

export const test = { input: '.gempa', expect: /gempa/i }

export async function handler(ctx) {
  const mode = (ctx.args[0] || '').toLowerCase()
  try {
    if (mode === 'list') {
      const list = await getGempaList(5)
      if (!list.length) return ctx.reply(ctx.t('gempa.notFound'))
      const lines = [ctx.t('gempa.listHeader')]
      list.forEach((g, i) => {
        lines.push(ctx.t('gempa.listItem', { n: i + 1, mag: g.magnitude, depth: g.depth, date: g.date, time: g.time, region: g.region }))
      })
      const body = lines.join('\n')
      return sendButtons(ctx.sock, ctx.chat, {
        title: 'KANA',
        body,
        footer: ctx.t('menu.footer'),
        replies: [{ text: ctx.t('gempa.btnLatest'), id: '.gempa' }],
        textFallback: body,
      })
    }
    const latest = await getLatestGempa()
    if (!latest) return ctx.reply(ctx.t('gempa.notFound'))
    const row = (labelKey, value) => ctx.t('gempa.line', { label: ctx.t(labelKey), value })
    const lines = [
      ctx.t('gempa.header'),
      row('gempa.dateLabel', `${latest.date}, ${latest.time}`),
      row('gempa.magLabel', latest.magnitude),
      row('gempa.depthLabel', latest.depth),
      row('gempa.regionLabel', latest.region),
    ]
    if (latest.felt) lines.push(row('gempa.feltLabel', latest.felt))
    const body = lines.join('\n')
    if (latest.shakemapUrl) {
      try {
        const media = await downloadBuffer(latest.shakemapUrl, { maxBytes: MAX_IMAGE_BYTES })
        if (media.contentType.startsWith('image/')) {
          await sendImage(ctx, media.buffer, {
            caption: ctx.t('gempa.caption', { mag: latest.magnitude, region: latest.region }),
          })
        }
      } catch {
        // shakemap gagal diunduh: teks tetap dikirim
      }
    }
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('gempa.btnList'), id: '.gempa list' }],
      textFallback: body,
    })
  } catch (err) {
    return ctx.reply(ctx.t('gempa.failed', { message: err.message }))
  }
}
