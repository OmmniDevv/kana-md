// Pemeriksa vulgar dewasa: tebak atribut kontol dari nama, murni
// hiburan. Port perilaku RYO-YAMADA-MD plugins/fun/cekkontol.js atas
// perintah owner 2026-11-05 sebagai fitur premium, ditulis ulang gaya
// KANA mengikuti keluarga plugins/cek (hasil deterministik dari nama,
// bukan acak liar seperti RYO).
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: "cekkontol",
  alias: [],
  category: "cek",
  description: { id: "Pemeriksa vulgar: tebak atribut kontol dari nama (premium, khusus 18+, hiburan dewasa)", en: "Vulgar checker: guess penis attributes from a name (premium, 18+ only, adult humor)" },
  usage: ".cekkontol <nama>",
  example: ".cekkontol Budi",
  cooldown: 5,
  isPrivate: true,
  premium: true,
}

export const i18n = {
  id: {
    "cekkontol": {
      title: "Cek kontol",
      hint: "╭─❏ 🔞 「 *CEK KONTOL* 」\n┊ Tulis namanya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.cekkontol Budi*\n╰━━━━━━━",
      result: "╭─❏ 🔞 「 *CEK KONTOL* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴡᴀʀɴᴀ: *{warna}*\n┊ ʙᴜʟᴜ: *{bulu}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ᴜᴋᴜʀᴀɴ: *{ukuran} cm*\n╰━━━━━━━\n{disclaimer}",
      disclaimer: "Ini cuma hiburan dewasa buat pengguna premium yaa, hasilnya ramalan iseng KANA dari nama, bukan ukuran beneran~",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "cekkontol": {
      title: "Penis check",
      hint: "╭─❏ 🔞 「 *PENIS CHECK* 」\n┊ Write the name please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.cekkontol Budi*\n╰━━━━━━━",
      result: "╭─❏ 🔞 「 *PENIS CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴄᴏʟᴏʀ: *{warna}*\n┊ ʜᴀɪʀ: *{bulu}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ꜱɪᴢᴇ: *{ukuran} cm*\n╰━━━━━━━\n{disclaimer}",
      disclaimer: "Just adult humor for premium users, the result is KANA playful name reading, not a real measurement~",
      btnAgain: "Check Again",
    },
  },
}

const WARNA = ['Putih mulus', 'Putih', 'Hitam']
const BULU = ['Lebat', 'Tipis', 'Tidak ada', 'Bersih']
const STATUS = ['Masih perjaka', 'Sudah tidak perjaka', 'Besar', 'Panjang', 'Sudah disunat', 'Belum disunat']

export function hashCode(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function cekKontolResult(name) {
  const base = String(name ?? '').toLowerCase()
  const pick = (list, salt) => list[hashCode(base + ':cekkontol:' + salt) % list.length]
  return {
    warna: pick(WARNA, 'warna'),
    bulu: pick(BULU, 'bulu'),
    status: pick(STATUS, 'status'),
    ukuran: 10 + (hashCode(base + ':cekkontol:ukuran') % 15),
  }
}

export const test = { input: '.cekkontol Budi', expect: /CEK KONTOL|PENIS CHECK/ }
export async function handler(ctx) {
  const target = (ctx.text || '').trim()
  if (!target) return ctx.reply(ctx.t('cekkontol.hint'))
  const r = cekKontolResult(target)
  const body = ctx.t('cekkontol.result', { name: target, ...r, disclaimer: ctx.t('cekkontol.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('cekkontol.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('cekkontol.btnAgain'), id: '.cekkontol ' + target }], textFallback: body })
}
