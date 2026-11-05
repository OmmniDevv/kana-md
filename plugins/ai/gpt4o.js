
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "gpt4o",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya GPT-4o: serbaguna dan ramah, di mesin AI KANA (bukan model OpenAI asli)", en: "Chat persona in the style of GPT-4o: versatile and friendly, on the KANA AI engine (not the real OpenAI model)" },
  usage: ".gpt4o",
  example: ".gpt4o",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "gpt4o": {
      hint: "╭─❏ 🤖 「 *GPT4O* 」\n┊ Ini persona bergaya GPT-4o di mesin AI KANA, bukan model GPT-4o asli dari OpenAI yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.gpt4o jelaskan kenapa langit berwarna biru*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona GPT-4o lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "gpt4o": {
      hint: "╭─❏ 🤖 「 *GPT4O* 」\n┊ This is a GPT-4o styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.gpt4o explain why the sky is blue*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the GPT-4o persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama GPT-4o di bot WhatsApp KANA. Kamu BUKAN model GPT-4o asli dari OpenAI; kamu persona bergaya GPT-4o yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model GPT-4o asli dari OpenAI; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya GPT-4o di KANA. Gaya khasmu: serbaguna dan ramah: penjelasan jelas untuk topik apa pun, dengan contoh sehari hari bila membantu. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named GPT-4o in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a GPT-4o styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a GPT-4o styled persona in KANA. Your signature style: versatile and friendly: clear explanations for any topic, with everyday examples when they help. Answer in friendly, helpful English."
export const test = { input: '.gpt4o jelaskan kenapa langit berwarna biru', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('gpt4o.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('gpt4o.notcfg'))
  await ctx.reply(ctx.t('gpt4o.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('gpt4o.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('gpt4o.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('gpt4o.btnReset'), id: '.aireset' }], textFallback: body })
}
