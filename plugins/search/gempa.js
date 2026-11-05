import { getLatestGempa, getGempaList } from '../../src/scrapers/search/gempa.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'gempa',
  alias: ['earthquake', 'bmkggempa'],
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
      failed: '╭─❏ 😖 「 *DATA GEMPA GAGAL DIAMBIL* 」\n┊ Mouu, data gempa BMKG lagi nggak bisa diambil: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *DATA GEMPA KOSONG* 」\n┊ Mouu, data gempanya kosong dari BMKG~\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      header: '╭─❏ 🌋 「 *GEMPA TERBARU (BMKG)* 」',
      line: '┊ {label}: *{value}*',
      dateLabel: 'ᴡᴀᴋᴛᴜ',
      magLabel: 'ᴍᴀɢɴɪᴛᴜᴅᴏ',
      depthLabel: 'ᴋᴇᴅᴀʟᴀᴍᴀɴ',
      regionLabel: 'ᴡɪʟᴀʏᴀʜ',
      feltLabel: 'ᴅɪʀᴀꜱᴀᴋᴀɴ',
      caption: 'Peta guncangan gempa {mag} di {region}',
      listHeader: '╭─❏ 🌋 「 *5 GEMPA TERAKHIR (BMKG)* 」',
      listItem: '┊ {n}. *M{mag}*, {depth}, {date} {time}\n┊ {region}',
      btnList: 'Lihat 5 terakhir',
      btnLatest: 'Gempa terbaru',
    },
  },
  en: {
    gempa: {
      failed: '╭─❏ 😖 「 *EARTHQUAKE DATA FAILED* 」\n┊ Mouu, BMKG earthquake data cannot be fetched: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *EARTHQUAKE DATA EMPTY* 」\n┊ Mouu, the earthquake data from BMKG is empty~\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🌋 「 *LATEST EARTHQUAKE (BMKG)* 」',
      line: '┊ {label}: *{value}*',
      dateLabel: 'ᴛɪᴍᴇ',
      magLabel: 'ᴍᴀɢɴɪᴛᴜᴅᴇ',
      depthLabel: 'ᴅᴇᴘᴛʜ',
      regionLabel: 'ʀᴇɢɪᴏɴ',
      feltLabel: 'ꜰᴇʟᴛ',
      caption: 'Shakemap of the {mag} quake in {region}',
      listHeader: '╭─❏ 🌋 「 *LAST 5 EARTHQUAKES (BMKG)* 」',
      listItem: '┊ {n}. *M{mag}*, {depth}, {date} {time}\n┊ {region}',
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
      lines.push('╰━━━━━━━')
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
    lines.push('╰━━━━━━━')
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
