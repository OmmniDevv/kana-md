// Pemeriksa vulgar dewasa: tebak atribut memek dari nama, murni
// hiburan. Port perilaku RYO-YAMADA-MD plugins/fun/cekmemek.js atas
// perintah owner 2026-11-05 sebagai fitur premium, ditulis ulang gaya
// KANA mengikuti keluarga plugins/cek (hasil deterministik dari nama,
// bukan acak liar seperti RYO).
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: "cekmemek",
  alias: ["cekmmk"],
  category: "cek",
  description: { id: "Pemeriksa vulgar: tebak atribut memek dari nama (premium, khusus 18+, hiburan dewasa)", en: "Vulgar checker: guess vagina attributes from a name (premium, 18+ only, adult humor)" },
  usage: ".cekmemek <nama>",
  example: ".cekmemek Sari",
  cooldown: 5,
  isPrivate: true,
  premium: true,
}

export const i18n = {
  id: {
    "cekmemek": {
      title: "Cek memek",
      hint: "╭─❏ 🔞 「 *CEK MEMEK* 」\n┊ Tulis namanya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.cekmemek Sari*\n╰━━━━━━━",
      result: "╭─❏ 🔞 「 *CEK MEMEK* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴡᴀʀɴᴀ: *{warna}*\n┊ ʙᴜʟᴜ: *{bulu}*\n┊ ᴋᴏɴᴅɪꜱɪ: *{kondisi}*\n╰━━━━━━━\n{disclaimer}",
      disclaimer: "Ini cuma hiburan dewasa buat pengguna premium yaa, hasilnya ramalan iseng KANA dari nama, bukan ukuran beneran~",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "cekmemek": {
      title: "Vagina check",
      hint: "╭─❏ 🔞 「 *VAGINA CHECK* 」\n┊ Write the name please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.cekmemek Sari*\n╰━━━━━━━",
      result: "╭─❏ 🔞 「 *VAGINA CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴄᴏʟᴏʀ: *{warna}*\n┊ ʜᴀɪʀ: *{bulu}*\n┊ ᴄᴏɴᴅɪᴛɪᴏɴ: *{kondisi}*\n╰━━━━━━━\n{disclaimer}",
      disclaimer: "Just adult humor for premium users, the result is KANA playful name reading, not a real measurement~",
      btnAgain: "Check Again",
    },
  },
}

const WARNA = ['Putih mulus', 'Hitam', 'Pink', 'Pink mulus', 'Hitam mulus']
const BULU = ['Lebat', 'Tipis', 'Tidak ada', 'Bersih']
const KONDISI = ['Masih perawan', 'Sudah tidak perawan', 'Besar', 'Sempit']

export function hashCode(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function cekMemekResult(name) {
  const base = String(name ?? '').toLowerCase()
  const pick = (list, salt) => list[hashCode(base + ':cekmemek:' + salt) % list.length]
  return {
    warna: pick(WARNA, 'warna'),
    bulu: pick(BULU, 'bulu'),
    kondisi: pick(KONDISI, 'kondisi'),
  }
}

export const test = { input: '.cekmemek Sari', expect: /CEK MEMEK|VAGINA CHECK/ }
export async function handler(ctx) {
  const target = (ctx.text || '').trim()
  if (!target) return ctx.reply(ctx.t('cekmemek.hint'))
  const r = cekMemekResult(target)
  const body = ctx.t('cekmemek.result', { name: target, ...r, disclaimer: ctx.t('cekmemek.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('cekmemek.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('cekmemek.btnAgain'), id: '.cekmemek ' + target }], textFallback: body })
}
