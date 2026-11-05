
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "webpilot",
  alias: [],
  category: "ai",
  description: { id: "Fitur webpilot versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD webpilot feature, rewritten in KANA style" },
  usage: ".webpilot",
  example: ".webpilot",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "webpilot": {
      hint: "╭─❏ 🤖 「 *WEBPILOT* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.webpilot halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode webpilot lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "webpilot": {
      hint: "╭─❏ 🤖 「 *WEBPILOT* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.webpilot hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, webpilot mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI webpilot di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: webpilot."
const PERSONA_EN = "You are the webpilot AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: webpilot."
export const test = { input: '.webpilot halo', expect: /webpilot|pikir|thinking/i }
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
