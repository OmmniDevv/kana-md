
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "kapan",
  alias: [],
  category: "fun",
  description: { id: "Tanya bot kapan sesuatu", en: "KANA version of the Elaina-MD kapan feature, rewritten in KANA style" },
  usage: ".kapan",
  example: ".kapan",
  cooldown: 5,
}

export const i18n = {
  id: {
    "kapan": {
      hint: "╭─❏ 🔮 「 *KAPAN* 」\n┊ Tulis pertanyaannya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.kapan pertanyaan kamu*\n╰━━━━━━━",
      result: "╭─❏ 🔮 「 *KAPAN* 」\n┊ ᴘᴇʀᴛᴀɴʏᴀᴀɴ: *{q}*\n┊ ᴊᴀᴡᴀʙᴀɴ ᴋᴀɴᴀ: *{answer}*\n╰━━━━━━━",
      btnAgain: "Tanya Lagi",
    },
  },
  en: {
    "kapan": {
      hint: "╭─❏ 🔮 「 *KAPAN* 」\n┊ Write your question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.kapan your question*\n╰━━━━━━━",
      result: "╭─❏ 🔮 「 *KAPAN* 」\n┊ ǫᴜᴇꜱᴛɪᴏɴ: *{q}*\n┊ ᴋᴀɴᴀ ᴀɴꜱᴡᴇʀ: *{answer}*\n╰━━━━━━━",
      btnAgain: "Ask Again",
    },
  },
}

const ANSWERS = [
  { id: 'Ya, pasti!', en: 'Yes, definitely!' },
  { id: 'Tidak, sepertinya tidak.', en: 'No, it seems not.' },
  { id: 'Mungkin, coba lagi nanti.', en: 'Maybe, ask again later.' },
  { id: 'Aku yakin iya!', en: 'I am sure, yes!' },
  { id: 'Hmm, aku ragu.', en: 'Hmm, I doubt it.' },
  { id: 'Pasti bisa, semangat!', en: 'You surely can, keep it up!' },
  { id: 'Kayaknya belum saatnya.', en: 'It seems not the time yet.' },
  { id: 'InsyaAllah iya.', en: 'God willing, yes.' },
  { id: 'Jangan terlalu berharap, tapi peluangnya ada.', en: 'Do not hope too much, but there is a chance.' },
  { id: 'Tentu saja, kenapa tidak?', en: 'Of course, why not?' },
  { id: 'Fokus dulu, hasilnya mengikuti.', en: 'Focus first, results will follow.' },
  { id: 'KANA lihat peluangnya besar!', en: 'KANA sees a big chance!' },
]
export function pickIndex(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % ANSWERS.length
}
export const test = { input: '.kapan apakah besok cerah', expect: /kapan/i }
export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('kapan.hint'))
  const item = ANSWERS[pickIndex(q.toLowerCase() + ':kapan')]
  const answer = ctx.lang === 'en' ? item.en : item.id
  const body = ctx.t('kapan.result', { q, answer })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('kapan.btnAgain'), id: '.kapan' }], textFallback: body })
}
