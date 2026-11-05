import { sendButtons } from '../../src/ui/buttons.js'
import { wibDateString } from '../../src/services/user-service.js'

export const config = {
  name: 'cekpintar',
  alias: [],
  category: 'fun',
  description: { id: 'Cek persen kepintaran versi iseng KANA, buat hiburan', en: 'Check your smartness percent the playful KANA way, just for fun' },
  usage: '.cekpintar',
  example: '.cekpintar',
  cooldown: 3,
}

// Hash deterministik kecil jadi persen 0 sampai 100 (duplikasi disengaja,
// sama seperti di cekmood, supaya plugin tetap mandiri satu file).
export function hashPercent(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 101
}

export const i18n = {
  id: {
    cekpintar: {
      title: 'Cek Pintar 🧠',
      result: '╭─❏ 🧠 「 *CEK PINTAR* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴋᴇᴘɪɴᴛᴀʀᴀɴ: *{percent}%*\n┊ {comment}\n┊\n┊ {disclaimer}\n╰━━━━━━━',
      low: 'Otaknya lagi loading yaa... tidur cukup dulu, besok pasti lebih ngebut~ 😴✨',
      mid: 'Cukup pintar kok, apalagi kalau lagi fokus beneran~ 📚',
      high: 'Pintar nih! Ide-ide kamu hari ini layak didengerin~ (≧▽≦)',
      max: 'Level jenius terdeteksi! KANA sampai kagum nih~ 🎓🌟',
      disclaimer: 'Ini cuma hiburan yaa, persen iseng ini bukan tes IQ dan bukan ukuran pintar beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekpintar: {
      title: 'Smart Check 🧠',
      result: '╭─❏ 🧠 「 *SMART CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ꜱᴍᴀʀᴛɴᴇꜱꜱ: *{percent}%*\n┊ {comment}\n┊\n┊ {disclaimer}\n╰━━━━━━━',
      low: 'Your brain is still loading... get enough sleep first, tomorrow will be faster~ 😴✨',
      mid: 'Smart enough, especially when you truly focus~ 📚',
      high: 'You are sharp! Your ideas today are worth hearing~ (≧▽≦)',
      max: 'Genius level detected! Even KANA is impressed~ 🎓🌟',
      disclaimer: 'This is just for fun, this playful percent is not an IQ test and not a real measure of intelligence~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekpintar', expect: /cek pintar|smart check/i }

export async function handler(ctx) {
  const percent = hashPercent(`${ctx.senderDigits}:smart:${wibDateString()}`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekpintar.result', {
    name: ctx.pushName || ctx.senderDigits,
    percent,
    comment: ctx.t(`cekpintar.${band}`),
    disclaimer: ctx.t('cekpintar.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekpintar.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekpintar.btnAgain'), id: '.cekpintar' },
    ],
    textFallback: body,
  })
}
