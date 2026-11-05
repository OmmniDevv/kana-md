
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "deepseek",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya DeepSeek: analitis dan bernalar, di mesin AI KANA (bukan model DeepSeek asli)", en: "Chat persona in the style of DeepSeek: analytical and reasoning focused, on the KANA AI engine (not the real DeepSeek model)" },
  usage: ".deepseek",
  example: ".deepseek",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "deepseek": {
      hint: "╭─❏ 🤖 「 *DEEPSEEK* 」\n┊ Ini persona bergaya DeepSeek di mesin AI KANA, bukan model DeepSeek asli yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.deepseek berapa 17 kali 24, uraikan caranya*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona DeepSeek lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "deepseek": {
      hint: "╭─❏ 🤖 「 *DEEPSEEK* 」\n┊ This is a DeepSeek styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.deepseek what is 17 times 24, show the steps*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the DeepSeek persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama DeepSeek di bot WhatsApp KANA. Kamu BUKAN model DeepSeek asli; kamu persona bergaya DeepSeek yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model DeepSeek asli; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya DeepSeek di KANA. Gaya khasmu: analitis: uraikan penalaran langkah demi langkah sebelum kesimpulan, terutama untuk matematika, logika, dan kode. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named DeepSeek in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a DeepSeek styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a DeepSeek styled persona in KANA. Your signature style: analytical: lay out reasoning step by step before the conclusion, especially for math, logic, and code. Answer in friendly, helpful English."
export const test = { input: '.deepseek berapa 17 kali 24, uraikan caranya', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('deepseek.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('deepseek.notcfg'))
  await ctx.reply(ctx.t('deepseek.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('deepseek.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('deepseek.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('deepseek.btnReset'), id: '.aireset' }], textFallback: body })
}
