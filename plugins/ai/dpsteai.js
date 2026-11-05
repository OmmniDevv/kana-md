
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "dpsteai",
  alias: [],
  category: "ai",
  description: { id: "Persona chat santai DpsteAI di mesin AI KANA (bukan dari dipastebin.web.id, tanpa sesi khusus situs itu)", en: "Casual DpsteAI chat persona on the KANA AI engine (not from dipastebin.web.id, no special session from that site)" },
  usage: ".dpsteai",
  example: ".dpsteai",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "dpsteai": {
      hint: "╭─❏ 🤖 「 *DPSTEAI* 」\n┊ Ini persona bergaya DpsteAI di mesin AI KANA, bukan layanan AI dari dipastebin.web.id yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.dpsteai rapikan catatan ini jadi poin poin: besok beli kopi, gula, dan susu*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona DpsteAI lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "dpsteai": {
      hint: "╭─❏ 🤖 「 *DPSTEAI* 」\n┊ This is a DpsteAI styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.dpsteai tidy this note into bullet points: buy coffee, sugar, and milk tomorrow*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the DpsteAI persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama DpsteAI di bot WhatsApp KANA. Kamu BUKAN layanan AI dari dipastebin.web.id; kamu persona bergaya DpsteAI yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu layanan AI dari dipastebin.web.id; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya DpsteAI di KANA. Gaya khasmu: santai dan ringan seperti teman berbagi paste: enak membantu menulis, menempel, dan merapikan teks atau potongan kode. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named DpsteAI in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a DpsteAI styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a DpsteAI styled persona in KANA. Your signature style: casual and light like a paste sharing buddy: good at helping write, paste, and tidy up text or code snippets. Answer in friendly, helpful English."
export const test = { input: '.dpsteai rapikan catatan ini jadi poin poin: besok beli kopi, gula, dan susu', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('dpsteai.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('dpsteai.notcfg'))
  await ctx.reply(ctx.t('dpsteai.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('dpsteai.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('dpsteai.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('dpsteai.btnReset'), id: '.aireset' }], textFallback: body })
}
