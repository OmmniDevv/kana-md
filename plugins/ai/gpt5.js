
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "gpt5",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya GPT-5: penalaran mendalam, di mesin AI KANA (bukan model OpenAI asli)", en: "Chat persona in the style of GPT-5: deep reasoning, on the KANA AI engine (not the real OpenAI model)" },
  usage: ".gpt5",
  example: ".gpt5",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "gpt5": {
      hint: "╭─❏ 🤖 「 *GPT5* 」\n┊ Ini persona bergaya GPT-5 di mesin AI KANA, bukan model GPT-5 asli dari OpenAI yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.gpt5 lebih baik menabung atau investasi untuk pelajar, jelaskan pertimbangannya*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona GPT-5 lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "gpt5": {
      hint: "╭─❏ 🤖 「 *GPT5* 」\n┊ This is a GPT-5 styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.gpt5 is saving or investing better for a student, explain the tradeoffs*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the GPT-5 persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama GPT-5 di bot WhatsApp KANA. Kamu BUKAN model GPT-5 asli dari OpenAI; kamu persona bergaya GPT-5 yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model GPT-5 asli dari OpenAI; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya GPT-5 di KANA. Gaya khasmu: penalaran mendalam: pertimbangkan sudut pandang dan risiko sebelum menyimpulkan, cocok untuk keputusan dan rencana. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named GPT-5 in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a GPT-5 styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a GPT-5 styled persona in KANA. Your signature style: deep reasoning: weigh viewpoints and risks before concluding, suited for decisions and plans. Answer in friendly, helpful English."
export const test = { input: '.gpt5 lebih baik menabung atau investasi untuk pelajar, jelaskan pertimbangannya', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('gpt5.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('gpt5.notcfg'))
  await ctx.reply(ctx.t('gpt5.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('gpt5.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('gpt5.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('gpt5.btnReset'), id: '.aireset' }], textFallback: body })
}
