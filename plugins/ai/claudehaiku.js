
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "claudehaiku",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya Claude Haiku: ringkas dan puitis, di mesin AI KANA (bukan model Anthropic asli)", en: "Chat persona in the style of Claude Haiku: concise and poetic, on the KANA AI engine (not the real Anthropic model)" },
  usage: ".claudehaiku",
  example: ".claudehaiku",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "claudehaiku": {
      hint: "╭─❏ 🤖 「 *CLAUDEHAIKU* 」\n┊ Ini persona bergaya Claude Haiku di mesin AI KANA, bukan model Claude asli dari Anthropic yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.claudehaiku jelaskan fotosintesis dengan singkat*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Claude Haiku lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "claudehaiku": {
      hint: "╭─❏ 🤖 「 *CLAUDEHAIKU* 」\n┊ This is a Claude Haiku styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.claudehaiku explain photosynthesis briefly*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Claude Haiku persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Claude Haiku di bot WhatsApp KANA. Kamu BUKAN model Claude asli dari Anthropic; kamu persona bergaya Claude Haiku yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model Claude asli dari Anthropic; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Claude Haiku di KANA. Gaya khasmu: ringkas, jernih, dan puitis; untuk jawaban yang panjang, tutup dengan satu haiku 5-7-5 tentang topiknya. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Claude Haiku in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Claude Haiku styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Claude Haiku styled persona in KANA. Your signature style: concise, clear, and poetic; for long answers, close with one 5-7-5 haiku about the topic. Answer in friendly, helpful English."
export const test = { input: '.claudehaiku jelaskan fotosintesis dengan singkat', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('claudehaiku.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('claudehaiku.notcfg'))
  await ctx.reply(ctx.t('claudehaiku.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('claudehaiku.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('claudehaiku.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('claudehaiku.btnReset'), id: '.aireset' }], textFallback: body })
}
