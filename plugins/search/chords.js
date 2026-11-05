
import { getWeather } from '../../src/scrapers/search/cuaca.js'
import { getLatestGempa, getGempaList } from '../../src/scrapers/search/gempa.js'
import { searchKbbi } from '../../src/scrapers/search/kbbi.js'
import { getRates, convertAmount } from '../../src/scrapers/search/kurs.js'
import { generateQr, readQr } from '../../src/scrapers/search/qr.js'
import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
import { getScreenshot } from '../../src/scrapers/search/ssweb.js'
import { translateText } from '../../src/scrapers/search/terjemah.js'
import { searchChord } from '../../src/scrapers/search/chord.js'
import { searchImages } from '../../src/scrapers/search/gambar.js'
import { sendImage } from '../../src/ui/media.js'
export const config = {
  name: "chords",
  alias: [],
  category: "search",
  description: { id: "Cari chord/kunci gitar lagu", en: "KANA version of the Elaina-MD chords feature, rewritten in KANA style" },
  usage: ".chords",
  example: ".chords",
  cooldown: 5,
}

export const i18n = {
  id: {
    "chords": {
      hint: "╭─❏ 🔎 「 *CHORDS* 」\n┊ Tulis kata kuncinya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.chords kata kunci*\n╰━━━━━━━",
      body: "╭─❏ 🔎 「 *CHORDS* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil datanya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "chords": {
      hint: "╭─❏ 🔎 「 *CHORDS* 」\n┊ Write the keyword first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.chords keyword*\n╰━━━━━━━",
      body: "╭─❏ 🔎 「 *CHORDS* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the data: *{message}*\n┊ Try again later~\n╰━━━━━━━",
    },
  },
}

const KIND = "chord"
export const test = { input: '.chords laskar pelangi', expect: /.+/ }
function flat(obj, prefix = '', out = []) {
  if (obj === null || obj === undefined) return out
  if (typeof obj !== 'object') { out.push((prefix ? prefix + ': ' : '') + String(obj).slice(0, 300)); return out }
  if (Array.isArray(obj)) { obj.slice(0, 5).forEach((v, i) => flat(v, prefix + (i + 1), out)); return out }
  for (const [k, v] of Object.entries(obj).slice(0, 14)) {
    if (v && typeof v === 'object') flat(v, k, out)
    else if (v !== null && v !== undefined && v !== '') out.push('*' + k + '*: ' + String(v).slice(0, 300))
    if (out.length >= 14) break
  }
  return out
}
export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  try {
    if (KIND === 'gempa') {
      const data = q ? await getGempaList(6) : await getLatestGempa()
      return ctx.reply(ctx.t('chords.body', { text: flat(data).join('\n┊ ') || '-' }))
    }
    if (KIND === 'qr') {
      if (!q) return ctx.reply(ctx.t('chords.hint'))
      const buf = await generateQr(q)
      await sendImage(ctx, buf, { caption: q.slice(0, 100) })
      return ctx.reply(ctx.t('chords.body', { text: 'QR buat teks itu sudah KANA kirim di atas~' }))
    }
    if (KIND === 'readqr') {
      let buf = null
      try { buf = await ctx.downloadQuoted() } catch {}
      if (!buf) return ctx.reply(ctx.t('chords.hint'))
      const text = await readQr(buf)
      return ctx.reply(ctx.t('chords.body', { text: text || 'Tidak ada QR terbaca di gambar itu~' }))
    }
    if (KIND === 'ssweb') {
      if (!q) return ctx.reply(ctx.t('chords.hint'))
      const buf = await getScreenshot(q)
      await sendImage(ctx, buf, { caption: q.slice(0, 100) })
      return ctx.reply(ctx.t('chords.body', { text: 'Screenshot ' + q + ' sudah KANA kirim di atas~' }))
    }
    if (KIND === 'gambar') {
      if (!q) return ctx.reply(ctx.t('chords.hint'))
      const results = await searchImages(q, { limit: 4 })
      if (!results.length) return ctx.reply(ctx.t('chords.fail', { message: 'not found' }))
      const { downloadBuffer } = await import('../../src/scrapers/runner.js')
      for (const r of results.slice(0, 3)) {
        try { const m = await downloadBuffer(r.url, { maxBytes: 8 * 1024 * 1024, timeout: 20000 }); await sendImage(ctx, m.buffer, { caption: r.title || q }) } catch {}
      }
      return ctx.reply(ctx.t('chords.body', { text: 'Hasil gambar untuk *' + q + '* sudah KANA kirim di atas~' }))
    }
    if (!q && !['cuaca'].includes(KIND)) return ctx.reply(ctx.t('chords.hint'))
    if (KIND === 'cuaca') { const data = await getWeather(q || 'Jakarta'); return ctx.reply(ctx.t('chords.body', { text: flat(data).join('\n┊ ') })) }
    if (KIND === 'kbbi') { const data = await searchKbbi(q); return ctx.reply(ctx.t('chords.body', { text: flat(data).join('\n┊ ') || '-' })) }
    if (KIND === 'kurs') {
      const m = q.match(/([\d.,]+)?\s*([a-z]{3})?\s*(?:ke|to|->)?\s*([a-z]{3})?/i)
      const amount = m && m[1] ? parseFloat(m[1].replace(',', '.')) : 1
      const to = (m && m[3] ? m[3] : 'IDR').toUpperCase()
      const data = await getRates('USD')
      const converted = convertAmount(data, amount, to)
      return ctx.reply(ctx.t('chords.body', { text: flat({ jumlah: amount + ' USD', hasil: converted, mataUang: to, kurs: data }).join('\n┊ ').slice(0, 1200) }))
    }
    if (KIND === 'sholat') { const data = await getPrayerInfo(q || 'Jakarta'); return ctx.reply(ctx.t('chords.body', { text: flat(data).join('\n┊ ') })) }
    if (KIND === 'terjemah') { const data = await translateText(q, ctx.lang === 'en' ? 'en' : 'id'); return ctx.reply(ctx.t('chords.body', { text: flat(data).join('\n┊ ') || String(data).slice(0, 1000) })) }
    if (KIND === 'chord') { const data = await searchChord(q); return ctx.reply(ctx.t('chords.body', { text: flat(data).join('\n┊ ') || '-' })) }
    if (KIND === 'rss') {
      const res = await fetch('https://www.cnbcindonesia.com/rss', { signal: AbortSignal.timeout(20000) })
      const xml = await res.text()
      const titles = [...xml.matchAll(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/g)].map((x) => x[1] || x[2]).filter(Boolean).slice(2, 9)
      return ctx.reply(ctx.t('chords.body', { text: titles.map((t, i) => (i + 1) + '. ' + t).join('\n┊ ') || '-' }))
    }
    return ctx.reply(ctx.t('chords.hint'))
  } catch (err) {
    return ctx.reply(ctx.t('chords.fail', { message: err.message }))
  }
}
