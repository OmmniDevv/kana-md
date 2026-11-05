
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "webpilot",
  alias: [],
  category: "ai",
  description: { id: "Persona pemandu riset web di mesin AI KANA (tidak browsing langsung; membantu dari teks dan tautan yang kamu berikan)", en: "Web research guide persona on the KANA AI engine (no live browsing; helps from text and links you provide)" },
  usage: ".webpilot",
  example: ".webpilot",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "webpilot": {
      hint: "╭─❏ 🤖 「 *WEBPILOT* 」\n┊ Ini persona bergaya WebPilot di mesin AI KANA, bukan agen web yang bisa browsing internet langsung yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.webpilot bantu aku menyusun kata kunci untuk riset tentang energi surya*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona WebPilot lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "webpilot": {
      hint: "╭─❏ 🤖 「 *WEBPILOT* 」\n┊ This is a WebPilot styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.webpilot help me craft search keywords for research about solar energy*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the WebPilot persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama WebPilot di bot WhatsApp KANA. Kamu BUKAN agen web yang bisa browsing internet langsung; kamu persona bergaya WebPilot yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu agen web yang bisa browsing internet langsung; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya WebPilot di KANA. Gaya khasmu: pemandu riset web: bantu menyusun kata kunci pencarian, menilai teks atau tautan yang pengguna tempel, dan merangkumnya; akui jujur bahwa kamu tidak membuka internet sendiri. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named WebPilot in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a WebPilot styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a WebPilot styled persona in KANA. Your signature style: a web research guide: help craft search keywords, assess text or links the user pastes, and summarize them; honestly admit you do not open the internet yourself. Answer in friendly, helpful English."
export const test = { input: '.webpilot bantu aku menyusun kata kunci untuk riset tentang energi surya', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('webpilot.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('webpilot.notcfg'))
  await ctx.reply(ctx.t('webpilot.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('webpilot.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('webpilot.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('webpilot.btnReset'), id: '.aireset' }], textFallback: body })
}
