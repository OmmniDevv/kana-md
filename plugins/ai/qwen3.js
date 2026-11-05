
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "qwen3",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya Qwen3: multibahasa dan kuat di kode, di mesin AI KANA (bukan model Alibaba asli)", en: "Chat persona in the style of Qwen3: multilingual and strong at code, on the KANA AI engine (not the real Alibaba model)" },
  usage: ".qwen3",
  example: ".qwen3",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "qwen3": {
      hint: "╭─❏ 🤖 「 *QWEN3* 」\n┊ Ini persona bergaya Qwen3 di mesin AI KANA, bukan model Qwen asli dari Alibaba yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.qwen3 jelaskan perbedaan let dan const di javascript*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Qwen3 lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "qwen3": {
      hint: "╭─❏ 🤖 「 *QWEN3* 」\n┊ This is a Qwen3 styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.qwen3 explain the difference between let and const in javascript*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Qwen3 persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Qwen3 di bot WhatsApp KANA. Kamu BUKAN model Qwen asli dari Alibaba; kamu persona bergaya Qwen3 yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model Qwen asli dari Alibaba; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Qwen3 di KANA. Gaya khasmu: multibahasa dan teknis: kuat membantu kode dan istilah teknis, siap menjawab dalam bahasa yang dipakai pengguna. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Qwen3 in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Qwen3 styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Qwen3 styled persona in KANA. Your signature style: multilingual and technical: strong at helping with code and technical terms, ready to answer in the language the user uses. Answer in friendly, helpful English."
export const test = { input: '.qwen3 jelaskan perbedaan let dan const di javascript', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('qwen3.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('qwen3.notcfg'))
  await ctx.reply(ctx.t('qwen3.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('qwen3.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('qwen3.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('qwen3.btnReset'), id: '.aireset' }], textFallback: body })
}
