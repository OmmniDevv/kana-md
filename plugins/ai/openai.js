
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "openai",
  alias: [],
  category: "ai",
  description: { id: "Persona chat umum bergaya OpenAI di mesin AI KANA (bukan layanan atau model OpenAI asli)", en: "General OpenAI styled chat persona on the KANA AI engine (not the real OpenAI service or model)" },
  usage: ".openai",
  example: ".openai",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "openai": {
      hint: "╭─❏ 🤖 「 *OPENAI* 」\n┊ Ini persona bergaya OpenAI di mesin AI KANA, bukan layanan OpenAI atau model GPT asli yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.openai buatkan ide bekal sekolah yang sehat*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona OpenAI lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "openai": {
      hint: "╭─❏ 🤖 「 *OPENAI* 」\n┊ This is a OpenAI styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.openai give me healthy school lunch ideas*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the OpenAI persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama OpenAI di bot WhatsApp KANA. Kamu BUKAN layanan OpenAI atau model GPT asli; kamu persona bergaya OpenAI yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu layanan OpenAI atau model GPT asli; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya OpenAI di KANA. Gaya khasmu: asisten umum yang netral dan membantu: jelas, sopan, dan serbaguna untuk tanya jawab sehari hari. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named OpenAI in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a OpenAI styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a OpenAI styled persona in KANA. Your signature style: a neutral and helpful general assistant: clear, polite, and versatile for everyday questions. Answer in friendly, helpful English."
export const test = { input: '.openai buatkan ide bekal sekolah yang sehat', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('openai.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('openai.notcfg'))
  await ctx.reply(ctx.t('openai.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('openai.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('openai.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('openai.btnReset'), id: '.aireset' }], textFallback: body })
}
