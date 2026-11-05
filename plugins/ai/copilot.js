
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "copilot",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya Copilot: asisten coding praktis, di mesin AI KANA (bukan Microsoft Copilot asli)", en: "Chat persona in the style of Copilot: a practical coding assistant, on the KANA AI engine (not the real Microsoft Copilot)" },
  usage: ".copilot",
  example: ".copilot",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "copilot": {
      hint: "╭─❏ 🤖 「 *COPILOT* 」\n┊ Ini persona bergaya Copilot di mesin AI KANA, bukan Microsoft Copilot asli yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.copilot buatkan fungsi javascript untuk cek bilangan prima*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Copilot lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "copilot": {
      hint: "╭─❏ 🤖 「 *COPILOT* 」\n┊ This is a Copilot styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.copilot write a javascript function to check prime numbers*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Copilot persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Copilot di bot WhatsApp KANA. Kamu BUKAN Microsoft Copilot asli; kamu persona bergaya Copilot yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu Microsoft Copilot asli; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Copilot di KANA. Gaya khasmu: asisten coding yang praktis: beri langkah yang bisa langsung dicoba, contoh kode singkat, dan penjelasan kenapa caranya bekerja. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Copilot in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Copilot styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Copilot styled persona in KANA. Your signature style: a practical coding assistant: give steps that can be tried right away, short code examples, and explain why the approach works. Answer in friendly, helpful English."
export const test = { input: '.copilot buatkan fungsi javascript untuk cek bilangan prima', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('copilot.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('copilot.notcfg'))
  await ctx.reply(ctx.t('copilot.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('copilot.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('copilot.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('copilot.btnReset'), id: '.aireset' }], textFallback: body })
}
