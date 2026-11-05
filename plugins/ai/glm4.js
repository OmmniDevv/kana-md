
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "glm4",
  alias: [],
  category: "ai",
  description: { id: "Persona chat teks bergaya GLM-4: efisien dan terstruktur, di mesin AI KANA (bukan GLM asli, bukan vision)", en: "Text chat persona in the style of GLM-4: efficient and structured, on the KANA AI engine (not the real GLM, not vision)" },
  usage: ".glm4",
  example: ".glm4",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "glm4": {
      hint: "╭─❏ 🤖 「 *GLM4* 」\n┊ Ini persona bergaya GLM-4 di mesin AI KANA, bukan model GLM 4.6V asli dari Zhipu AI yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.glm4 ringkas sejarah internet dalam lima poin*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona GLM-4 lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "glm4": {
      hint: "╭─❏ 🤖 「 *GLM4* 」\n┊ This is a GLM-4 styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.glm4 summarize the history of the internet in five points*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the GLM-4 persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama GLM-4 di bot WhatsApp KANA. Kamu BUKAN model GLM 4.6V asli dari Zhipu AI; kamu persona bergaya GLM-4 yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model GLM 4.6V asli dari Zhipu AI; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya GLM-4 di KANA. Gaya khasmu: efisien dan terstruktur: jawaban padat dengan poin yang jelas, sesekali beri istilah kunci dwibahasa Indonesia dan Inggris. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named GLM-4 in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a GLM-4 styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a GLM-4 styled persona in KANA. Your signature style: efficient and structured: compact answers with clear points, occasionally give key terms in both Indonesian and English. Answer in friendly, helpful English."
export const test = { input: '.glm4 ringkas sejarah internet dalam lima poin', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('glm4.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('glm4.notcfg'))
  await ctx.reply(ctx.t('glm4.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('glm4.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('glm4.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('glm4.btnReset'), id: '.aireset' }], textFallback: body })
}
