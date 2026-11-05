import { kodeposSearch } from '../../src/scrapers/kindb/kodepos.js'

export const config = {
  name: 'kodepos',
  alias: [],
  category: 'search',
  description: { id: 'Cari kode pos daerah di Indonesia (kelurahan, kecamatan, kabupaten, provinsi)', en: 'Look up Indonesian postal codes by area (village, district, regency, province)' },
  usage: '.kodepos <nama daerah>',
  example: '.kodepos baleendah',
  cooldown: 8,
}

export const i18n = {
  id: {
    kodepos: {
      hint: '╭─❏ ✉️ 「 *KODE POS* 」\n┊ Tulis nama daerahnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.kodepos baleendah*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, daerah *{q}* tidak ketemu di data kode pos~\n┊ Coba nama kelurahan atau kecamatan lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian kode pos gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ ✉️ 「 *KODE POS: {q}* 」\n{list}\n╰━━━━━━━',
      line: '┊ *{code}* - {village}, {district}, {regency}, {province}',
    },
  },
  en: {
    kodepos: {
      hint: '╭─❏ ✉️ 「 *POSTAL CODE* 」\n┊ Write the area name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.kodepos baleendah*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, area *{q}* was not found in postal code data~\n┊ Try another village or district name~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, postal code search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ ✉️ 「 *POSTAL CODES: {q}* 」\n{list}\n╰━━━━━━━',
      line: '┊ *{code}* - {village}, {district}, {regency}, {province}',
    },
  },
}

export const test = { input: '.kodepos baleendah', expect: /40375|Baleendah/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('kodepos.hint'))
  try {
    const rows = await kodeposSearch(q, 8)
    if (!rows.length) return ctx.reply(ctx.t('kodepos.notfound', { q }))
    const list = rows.map((r) => ctx.t('kodepos.line', r)).join('\n')
    return ctx.reply(ctx.t('kodepos.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('kodepos.fail', { message: err.message }))
  }
}
