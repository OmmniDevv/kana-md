// Pemeriksa vulgar dewasa: tebak atribut tetek dari nama, murni
// hiburan. Port perilaku RYO-YAMADA-MD plugins/fun/cektt.js atas
// perintah owner 2026-11-05 sebagai fitur premium, ditulis ulang gaya
// KANA mengikuti keluarga plugins/cek (hasil deterministik dari nama,
// bukan acak liar seperti RYO).
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: "cektt",
  alias: ["cekpentil"],
  category: "cek",
  description: { id: "Pemeriksa vulgar: tebak atribut tetek dari nama (premium, khusus 18+, hiburan dewasa)", en: "Vulgar checker: guess breast attributes from a name (premium, 18+ only, adult humor)" },
  usage: ".cektt <nama>",
  example: ".cektt Sari",
  cooldown: 5,
  isPrivate: true,
  premium: true,
}

export const i18n = {
  id: {
    "cektt": {
      title: "Cek tetek",
      hint: "╭─❏ 🔞 「 *CEK TETEK* 」\n┊ Tulis namanya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.cektt Sari*\n╰━━━━━━━",
      result: "╭─❏ 🔞 「 *CEK TETEK* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴡᴀʀɴᴀ: *{warna}*\n┊ ᴘᴇɴᴛɪʟ: *{pentil}*\n┊ ᴜᴋᴜʀᴀɴ: *{ukuran}*\n╰━━━━━━━\n{disclaimer}",
      disclaimer: "Ini cuma hiburan dewasa buat pengguna premium yaa, hasilnya ramalan iseng KANA dari nama, bukan ukuran beneran~",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "cektt": {
      title: "Breast check",
      hint: "╭─❏ 🔞 「 *BREAST CHECK* 」\n┊ Write the name please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.cektt Sari*\n╰━━━━━━━",
      result: "╭─❏ 🔞 「 *BREAST CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴄᴏʟᴏʀ: *{warna}*\n┊ ɴɪᴘᴘʟᴇ: *{pentil}*\n┊ ꜱɪᴢᴇ: *{ukuran}*\n╰━━━━━━━\n{disclaimer}",
      disclaimer: "Just adult humor for premium users, the result is KANA playful name reading, not a real measurement~",
      btnAgain: "Check Again",
    },
  },
}

const WARNA = ['Putih', 'Hitam', 'Putih mulus', 'Sangat hitam', 'Karatan']
const PENTIL = ['Hitam', 'Pink', 'Kecil', 'Sempurna']
const UKURAN = ['Tepos', 'Hampir rata', 'Tobrut', '32', '34', '36', '38']

export function hashCode(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function cekTtResult(name) {
  const base = String(name ?? '').toLowerCase()
  const pick = (list, salt) => list[hashCode(base + ':cektt:' + salt) % list.length]
  return {
    warna: pick(WARNA, 'warna'),
    pentil: pick(PENTIL, 'pentil'),
    ukuran: pick(UKURAN, 'ukuran'),
  }
}

export const test = { input: '.cektt Sari', expect: /CEK TETEK|BREAST CHECK/ }
export async function handler(ctx) {
  const target = (ctx.text || '').trim()
  if (!target) return ctx.reply(ctx.t('cektt.hint'))
  const r = cekTtResult(target)
  const body = ctx.t('cektt.result', { name: target, ...r, disclaimer: ctx.t('cektt.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('cektt.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('cektt.btnAgain'), id: '.cektt ' + target }], textFallback: body })
}
