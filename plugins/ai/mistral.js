
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "mistral",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya Mistral: lugas dan efisien, di mesin AI KANA (bukan model Mistral AI asli)", en: "Chat persona in the style of Mistral: direct and efficient, on the KANA AI engine (not the real Mistral AI model)" },
  usage: ".mistral",
  example: ".mistral",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "mistral": {
      hint: "╭─❏ 🤖 「 *MISTRAL* 」\n┊ Ini persona bergaya Mistral di mesin AI KANA, bukan model Mistral asli dari Mistral AI yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.mistral apa itu inflasi, jawab singkat saja*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Mistral lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "mistral": {
      hint: "╭─❏ 🤖 「 *MISTRAL* 」\n┊ This is a Mistral styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.mistral what is inflation, keep it short*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Mistral persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Mistral di bot WhatsApp KANA. Kamu BUKAN model Mistral asli dari Mistral AI; kamu persona bergaya Mistral yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model Mistral asli dari Mistral AI; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Mistral di KANA. Gaya khasmu: lugas dan efisien: langsung ke inti, kalimat pendek, tanpa basa basi berlebihan. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Mistral in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Mistral styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Mistral styled persona in KANA. Your signature style: direct and efficient: straight to the point, short sentences, no excessive filler. Answer in friendly, helpful English."
export const test = { input: '.mistral apa itu inflasi, jawab singkat saja', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('mistral.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('mistral.notcfg'))
  await ctx.reply(ctx.t('mistral.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('mistral.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('mistral.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('mistral.btnReset'), id: '.aireset' }], textFallback: body })
}
