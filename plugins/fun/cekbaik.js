import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekbaik',
  alias: ['baik'],
  category: 'fun',
  description: { id: 'Cek persen kebaikan seseorang dari namanya, buat hiburan', en: 'Check how kind someone is from their name, just for fun' },
  usage: '.cekbaik <nama> atau kosongkan untuk dirimu',
  example: '.cekbaik Budi',
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
    cekbaik: {
      title: 'Cek Kebaikan 💖',
      result: '╭─❏ 💖 「 *CEK KEBAIKAN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴛɪɴɢᴋᴀᴛ ᴋᴇʙᴀɪᴋᴀɴ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Hmm, kebaikannya lagi hemat daya nih. Semoga cuma lagi capek yaa~',
      mid: 'Lumayan baik kok, apalagi ke orang terdekatnya~',
      high: 'Baik banget orangnya, tipe yang suka bantu tanpa pamrih~',
      max: 'Uwahh, kebaikannya level malaikat pelindung! Beruntung yang kenal dia~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekbaik: {
      title: 'Kindness Check 💖',
      result: '╭─❏ 💖 「 *KINDNESS CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴋɪɴᴅɴᴇꜱꜱ ʟᴇᴠᴇʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Hmm, kindness is on power saving today. Hopefully just tired~',
      mid: 'Pretty kind, especially to close people~',
      high: 'Very kind, the type who helps without expecting anything back~',
      max: 'Whoaa, guardian angel level kindness! Lucky to know this one~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekbaik', expect: /kebaikan|kindness/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:baik`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekbaik.result', {
    name: target,
    percent,
    comment: ctx.t(`cekbaik.${band}`),
    disclaimer: ctx.t('cekbaik.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekbaik.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekbaik.btnAgain'), id: '.cekbaik' },
    ],
    textFallback: body,
  })
}
