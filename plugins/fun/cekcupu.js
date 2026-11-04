import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekcupu',
  alias: ['cupu'],
  category: 'fun',
  description: { id: 'Cek persen cupu seseorang dari namanya, buat hiburan', en: 'Check how much of a newbie someone is, just for fun' },
  usage: '.cekcupu <nama> atau kosongkan untuk dirimu',
  example: '.cekcupu Budi',
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
    cekcupu: {
      title: 'Cek Cupu 🐣',
      result: '╭─❏ 🐣 「 *CEK CUPU* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴛɪɴɢᴋᴀᴛ ᴄᴜᴘᴜ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Tidak cupu sama sekali, sudah pro ini mah~',
      mid: 'Ada cupu-cupunya dikit, tapi masih aman~',
      high: 'Cupu terdeteksi! Masih sering salah pencet yaa~',
      max: 'CUPU LEGENDARIS! Baru pegang langsung bingung~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekcupu: {
      title: 'Newbie Check 🐣',
      result: '╭─❏ 🐣 「 *NEWBIE CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɴᴇᴡʙɪᴇ ʟᴇᴠᴇʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Not a newbie at all, practically a pro~',
      mid: 'A little newbie energy, but still safe~',
      high: 'Newbie detected! Still pressing the wrong buttons often~',
      max: 'LEGENDARY NEWBIE! Confused the moment they touch anything~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekcupu', expect: /cupu|newbie/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:cupu`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekcupu.result', {
    name: target,
    percent,
    comment: ctx.t(`cekcupu.${band}`),
    disclaimer: ctx.t('cekcupu.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekcupu.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekcupu.btnAgain'), id: '.cekcupu' },
    ],
    textFallback: body,
  })
}
