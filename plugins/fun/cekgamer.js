import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekgamer',
  alias: ['gamer'],
  category: 'fun',
  description: { id: 'Cek persen jiwa gamer seseorang dari namanya, buat hiburan', en: 'Check how much of a gamer someone is, just for fun' },
  usage: '.cekgamer <nama> atau kosongkan untuk dirimu',
  example: '.cekgamer Budi',
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
    cekgamer: {
      title: 'Cek Jiwa Gamer 🕹️',
      result: '╭─❏ 🕹️ 「 *CEK JIWA GAMER* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴊɪᴡᴀ ɢᴀᴍᴇʀ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Main game cuma buat selingan, tidak sampai lupa waktu~',
      mid: 'Setengah gamer, kalau sudah seru susah berhenti~',
      high: 'Gamer sejati! Rank dan event tidak pernah ketinggalan~',
      max: 'HIDUP UNTUK GAME! Tidur pun mimpi lagi push rank~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekgamer: {
      title: 'Gamer Soul Check 🕹️',
      result: '╭─❏ 🕹️ 「 *GAMER SOUL CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɢᴀᴍᴇʀ ꜱᴏᴜʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Plays games just for a break, never loses track of time~',
      mid: 'Half gamer, hard to stop once it gets exciting~',
      high: 'True gamer! Never misses ranks and events~',
      max: 'LIVES FOR GAMES! Even dreams about pushing rank~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekgamer', expect: /gamer/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:gamer`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekgamer.result', {
    name: target,
    percent,
    comment: ctx.t(`cekgamer.${band}`),
    disclaimer: ctx.t('cekgamer.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekgamer.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekgamer.btnAgain'), id: '.cekgamer' },
    ],
    textFallback: body,
  })
}
