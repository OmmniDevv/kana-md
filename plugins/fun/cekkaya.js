import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekkaya',
  alias: ['kaya'],
  category: 'fun',
  description: { id: 'Cek persen aura kekayaan seseorang, buat hiburan saja', en: 'Check someone future wealth aura, just for fun' },
  usage: '.cekkaya <nama> atau kosongkan untuk dirimu',
  example: '.cekkaya Budi',
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
    cekkaya: {
      title: 'Cek Kekayaan 💰',
      result: '╭─❏ 💰 「 *CEK KEKAYAAN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴀᴜʀᴀ ᴋᴇᴋᴀʏᴀᴀɴ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Masih mode hemat, rezekinya disimpan buat nanti~',
      mid: 'Lumayan, ada bakat jadi orang sukses kalau konsisten~',
      high: 'Aura sultan terdeteksi! Tinggal tunggu waktu saja~',
      max: 'KAYA RAYA MASA DEPAN! Dompet masa depannya full senyum~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekkaya: {
      title: 'Wealth Check 💰',
      result: '╭─❏ 💰 「 *WEALTH CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴡᴇᴀʟᴛʜ ᴀᴜʀᴀ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Still saving mode, fortune stored for later~',
      mid: 'Decent, has the talent to succeed if consistent~',
      high: 'Sultan aura detected! Just a matter of time~',
      max: 'FUTURE FILTHY RICH! The future wallet smiles widely~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekkaya', expect: /kekayaan|wealth/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:kaya`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekkaya.result', {
    name: target,
    percent,
    comment: ctx.t(`cekkaya.${band}`),
    disclaimer: ctx.t('cekkaya.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekkaya.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekkaya.btnAgain'), id: '.cekkaya' },
    ],
    textFallback: body,
  })
}
