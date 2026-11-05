
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "qwen3",
  alias: [],
  category: "ai",
  description: { id: "Fitur qwen3 versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD qwen3 feature, rewritten in KANA style" },
  usage: ".qwen3",
  example: ".qwen3",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "qwen3": {
      hint: "╭─❏ 🤖 「 *QWEN3* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.qwen3 halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode qwen3 lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "qwen3": {
      hint: "╭─❏ 🤖 「 *QWEN3* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.qwen3 hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, qwen3 mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI qwen3 di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: qwen3."
const PERSONA_EN = "You are the qwen3 AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: qwen3."
export const test = { input: '.qwen3 halo', expect: /qwen3|pikir|thinking/i }
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
