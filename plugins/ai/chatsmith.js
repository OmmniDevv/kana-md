
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "chatsmith",
  alias: [],
  category: "ai",
  description: { id: "AI Chat menggunakan Chat Smith (GPT-4o Mini)", en: "KANA version of the Elaina-MD chatsmith feature, rewritten in KANA style" },
  usage: ".chatsmith",
  example: ".chatsmith",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "chatsmith": {
      hint: "╭─❏ 🤖 「 *CHATSMITH* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.chatsmith halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode chatsmith lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "chatsmith": {
      hint: "╭─❏ 🤖 「 *CHATSMITH* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.chatsmith hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, chatsmith mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI chatsmith di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: chatsmith."
const PERSONA_EN = "You are the chatsmith AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: chatsmith."
export const test = { input: '.chatsmith halo', expect: /chatsmith|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('chatsmith.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('chatsmith.notcfg'))
  await ctx.reply(ctx.t('chatsmith.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('chatsmith.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('chatsmith.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('chatsmith.btnReset'), id: '.aireset' }], textFallback: body })
}
