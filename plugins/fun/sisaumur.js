import { sendButtons } from '../../src/ui/buttons.js'
import { hashPercent } from './cekmood.js'

export const config = {
  name: 'sisaumur',
  alias: ['ceksisaumur'],
  category: 'fun',
  description: { id: 'Cek sisa umur versi bercanda dari umur kamu sekarang', en: 'Joke remaining-lifespan check from your current age' },
  usage: '.sisaumur <umur>',
  example: '.sisaumur 17',
  cooldown: 3,
}

export const i18n = {
  id: {
    sisaumur: {
      hint: '╭─❏ ⏳ 「 *SISA UMUR* 」\n┊ Tulis umurmu yaa~ Contoh: .sisaumur 17\n╰━━━━━━━',
      body: '╭─❏ ⏳ 「 *CEK SISA UMUR (BERCANDA)* 」\n┊ ᴜᴍᴜʀ ꜱᴇᴋᴀʀᴀɴɢ: *{age} tahun*\n┊ ᴘʀᴀᴋɪʀᴀᴀɴ ꜱɪꜱᴀ: *{left} tahun lagi* (total {total} tahun)\n┊ {comment}\n┊ Ini cuma bercanda yaa, yang tahu umur asli cuma Tuhan. Jaga kesehatan biar panjang umur beneran~\n╰━━━━━━━ {mood}',
      young: 'Masih panjang banget perjalanannya, pakai buat hal baik yaa~',
      mid: 'Pas di masa emas, jangan disia-siakan~',
      wise: 'Sudah kaya pengalaman, sehat selalu yaa~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    sisaumur: {
      hint: '╭─❏ ⏳ 「 *REMAINING LIFESPAN* 」\n┊ Write your age please~ Example: .sisaumur 17\n╰━━━━━━━',
      body: '╭─❏ ⏳ 「 *REMAINING LIFESPAN CHECK (JOKE)* 」\n┊ ᴄᴜʀʀᴇɴᴛ ᴀɢᴇ: *{age}*\n┊ ᴇꜱᴛɪᴍᴀᴛᴇᴅ ʟᴇꜰᴛ: *{left} more years* (total {total})\n┊ {comment}\n┊ This is only a joke, only God knows the real lifespan. Stay healthy for a truly long life~\n╰━━━━━━━ {mood}',
      young: 'The journey is still very long, use it for good things~',
      mid: 'Right in the golden years, do not waste them~',
      wise: 'Rich in experience, stay healthy always~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.sisaumur', expect: /umur|age/i }

export async function handler(ctx) {
  const age = parseInt(ctx.text || '', 10)
  if (!Number.isFinite(age) || age < 1 || age > 120) return ctx.reply(ctx.t('sisaumur.hint'))
  const seed = hashPercent(`${ctx.senderDigits}:sisaumur`)
  const total = 70 + Math.floor((seed / 100) * 30)
  const left = Math.max(1, total - age)
  const comment = age < 30 ? ctx.t('sisaumur.young') : age < 55 ? ctx.t('sisaumur.mid') : ctx.t('sisaumur.wise')
  const body = ctx.t('sisaumur.body', { age, left, total, comment, mood: ctx.say('sayang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('sisaumur.btnAgain'), id: '.sisaumur' }],
    textFallback: body,
  })
}
