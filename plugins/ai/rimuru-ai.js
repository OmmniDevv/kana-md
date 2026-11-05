
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "rimuru-ai",
  alias: [],
  category: "ai",
  description: { id: "Fitur rimuru-ai versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD rimuru-ai feature, rewritten in KANA style" },
  usage: ".rimuru-ai",
  example: ".rimuru-ai",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "rimuru-ai": {
      hint: "╭─❏ 🤖 「 *RIMURU-AI* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.rimuru-ai halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode rimuru-ai lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "rimuru-ai": {
      hint: "╭─❏ 🤖 「 *RIMURU-AI* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.rimuru-ai hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, rimuru-ai mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI rimuru-ai di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: rimuru-ai."
const PERSONA_EN = "You are the rimuru-ai AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: rimuru-ai."
export const test = { input: '.rimuru-ai halo', expect: /rimuru-ai|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('rimuru-ai.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('rimuru-ai.notcfg'))
  await ctx.reply(ctx.t('rimuru-ai.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('rimuru-ai.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('rimuru-ai.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('rimuru-ai.btnReset'), id: '.aireset' }], textFallback: body })
}
