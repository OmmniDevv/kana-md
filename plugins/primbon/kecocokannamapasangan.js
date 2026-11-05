import { sendButtons } from '../../src/ui/buttons.js'
import { getKecocokanNama } from '../../src/scrapers/search/primbon.js'

// Kecocokan nama pasangan primbon: sisi positif, sisi negatif, dan
// catatan dua nama dari API primbon Siputzx, sama seperti padanan
// Elaina-MD. Tidak ada lagi persen kecocokan karangan dari hash.
export const config = {
  name: 'kecocokannamapasangan',
  alias: ['cocoknama', 'matchname'],
  category: 'primbon',
  description: { id: 'Cek kecocokan nama pasangan menurut data primbon', en: 'Check a couple name match from primbon data' },
  usage: '.kecocokannamapasangan <nama1> <nama2>',
  example: '.kecocokannamapasangan putu keyla',
  cooldown: 5,
}

export const i18n = {
  id: {
    kecocokannamapasangan: {
      usage: '╭─❏ 💕 「 *KECOCOKAN NAMA* 」\n┊ Tulis dua namanya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.kecocokannamapasangan putu keyla*\n╰━━━━━━━',
      title: 'Kecocokan Nama Primbon',
      result: '╭─❏ 💕 「 *KECOCOKAN NAMA PASANGAN* 」\n┊ 👤 *{namaAnda}*\n┊ 💑 *{namaPasangan}*\n┊\n┊ ✅ *ꜱɪꜱɪ ᴘᴏꜱɪᴛɪꜰ:*\n┊ {positif}\n┊\n┊ ❌ *ꜱɪꜱɪ ɴᴇɢᴀᴛɪꜰ:*\n┊ {negatif}\n┊\n┊ _{catatan}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *KECOCOKAN NAMA GAGAL* 」\n┊ Mouu, sumber data primbonnya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Pasangan Lain',
    },
  },
  en: {
    kecocokannamapasangan: {
      usage: '╭─❏ 💕 「 *NAME MATCH* 」\n┊ Write both names first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.kecocokannamapasangan putu keyla*\n╰━━━━━━━',
      title: 'Primbon Name Match',
      result: '╭─❏ 💕 「 *COUPLE NAME MATCH* 」\n┊ 👤 *{namaAnda}*\n┊ 💑 *{namaPasangan}*\n┊\n┊ ✅ *ᴘᴏꜱɪᴛɪᴠᴇ ꜱɪᴅᴇ:*\n┊ {positif}\n┊\n┊ ❌ *ɴᴇɢᴀᴛɪᴠᴇ ꜱɪᴅᴇ:*\n┊ {negatif}\n┊\n┊ _{catatan}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *NAME MATCH FAILED* 」\n┊ Mouu, the primbon data source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Couple',
    },
  },
}

export const test = { input: '.kecocokannamapasangan putu keyla', expect: /kecocokan nama pasangan|couple name match/i }

// Uraikan dua nama dari teks bebas: pemisah &, |, koma, atau kata "dan"
// didahulukan; tanpa pemisah, dua token pertama ala Elaina yang dipakai.
export function parsePasanganArgs(text) {
  const raw = String(text || '').trim()
  if (!raw) return null
  const separated = raw.split(/\s*(?:&|\||,|\bdan\b|\bvs\b)\s*/i).map((s) => s.trim()).filter(Boolean)
  if (separated.length >= 2) return { nama1: separated[0].slice(0, 40), nama2: separated[1].slice(0, 40) }
  const tokens = raw.split(/\s+/).filter(Boolean)
  if (tokens.length >= 2) return { nama1: tokens[0].slice(0, 40), nama2: tokens[1].slice(0, 40) }
  return null
}

export function formatKecocokanNama(t, data) {
  return t('kecocokannamapasangan.result', {
    namaAnda: data.namaAnda,
    namaPasangan: data.namaPasangan,
    positif: data.positif,
    negatif: data.negatif,
    catatan: data.catatan,
  })
}

export async function handler(ctx) {
  const input = parsePasanganArgs(ctx.text || (ctx.args || []).join(' '))
  if (!input) return ctx.reply(ctx.t('kecocokannamapasangan.usage'))
  let data
  try {
    data = await getKecocokanNama(input.nama1, input.nama2)
  } catch (err) {
    return ctx.reply(ctx.t('kecocokannamapasangan.fail', { message: err.message }))
  }
  const body = formatKecocokanNama(ctx.t, data)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kecocokannamapasangan.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('kecocokannamapasangan.btnAgain'), id: '.kecocokannamapasangan' }],
    textFallback: body,
  })
}
