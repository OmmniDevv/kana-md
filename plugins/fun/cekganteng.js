import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekganteng',
  alias: ['ganteng'],
  category: 'fun',
  description: { id: 'Cek persen kegantengan seseorang dari namanya, buat hiburan', en: 'Check how handsome someone is from their name, just for fun' },
  usage: '.cekganteng <nama> atau kosongkan untuk dirimu',
  example: '.cekganteng Budi',
  cooldown: 3,
}

// Hash deterministik kecil jadi persen 0 sampai 100. Duplikasi disengaja
// di tiap plugin cek-* supaya plugin tetap mandiri satu file.
export function hashPercent(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 101
}

export const i18n = {
  id: {
    cekganteng: {
      title: 'Cek Kegantengan 😎',
      result: '╭─❏ 😎 「 *CEK KEGANTENGAN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴛɪɴɢᴋᴀᴛ ᴋᴇɢᴀɴᴛᴇɴɢᴀɴ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Gantengnya tipe awet, yang penting nyaman dilihat lama-lama~',
      mid: 'Gantengnya pas, apalagi kalau lagi senyum~',
      high: 'Ganteng menonjol! Aura tokoh utamanya kuat~',
      max: 'GANTENG PARAH! Lewat saja bisa bikin orang menoleh dua kali~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekganteng: {
      title: 'Handsome Check 😎',
      result: '╭─❏ 😎 「 *HANDSOME CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʜᴀɴᴅꜱᴏᴍᴇ ʟᴇᴠᴇʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'The lasting type of handsome, comfortable to look at~',
      mid: 'Just the right handsome, especially when smiling~',
      high: 'Strikingly handsome! Strong main character aura~',
      max: 'EXTREMELY HANDSOME! People turn their heads twice just passing by~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekganteng', expect: /kegantengan|handsome/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:ganteng`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekganteng.result', {
    name: target,
    percent,
    comment: ctx.t(`cekganteng.${band}`),
    disclaimer: ctx.t('cekganteng.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekganteng.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekganteng.btnAgain'), id: '.cekganteng' },
    ],
    textFallback: body,
  })
}
