import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekmalas',
  alias: ['malas'],
  category: 'fun',
  description: { id: 'Cek persen malas seseorang hari ini, buat hiburan saja', en: 'Check how lazy someone is today, just for fun' },
  usage: '.cekmalas <nama> atau kosongkan untuk dirimu',
  example: '.cekmalas Budi',
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
    cekmalas: {
      title: 'Cek Malas 🛋️',
      result: '╭─❏ 🛋️ 「 *CEK MALAS* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴛɪɴɢᴋᴀᴛ ᴍᴀʟᴀꜱ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Rajin sekali, matahari saja kalah bangun~',
      mid: 'Malasnya wajar, masih bisa digerakkan pakai makanan~',
      high: 'Malas terdeteksi akut, rebahan adalah jalan ninjanya~',
      max: 'MALAS LEGENDARIS! Menggerakkan jempol saja terasa olahraga~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekmalas: {
      title: 'Laziness Check 🛋️',
      result: '╭─❏ 🛋️ 「 *LAZINESS CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʟᴀᴢɪɴᴇꜱꜱ ʟᴇᴠᴇʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Very diligent, wakes up earlier than the sun~',
      mid: 'Normal laziness, still movable with food~',
      high: 'Acute laziness detected, lying down is the ninja way~',
      max: 'LEGENDARY LAZINESS! Moving a thumb feels like exercise~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekmalas', expect: /malas|lazy/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:malas`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekmalas.result', {
    name: target,
    percent,
    comment: ctx.t(`cekmalas.${band}`),
    disclaimer: ctx.t('cekmalas.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekmalas.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekmalas.btnAgain'), id: '.cekmalas' },
    ],
    textFallback: body,
  })
}
