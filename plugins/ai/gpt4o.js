
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "gpt4o",
  alias: [],
  category: "ai",
  description: { id: "Fitur gpt4o versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD gpt4o feature, rewritten in KANA style" },
  usage: ".gpt4o",
  example: ".gpt4o",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "gpt4o": {
      hint: "╭─❏ 🤖 「 *GPT4O* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.gpt4o halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode gpt4o lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "gpt4o": {
      hint: "╭─❏ 🤖 「 *GPT4O* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.gpt4o hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, gpt4o mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI gpt4o di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: gpt4o."
const PERSONA_EN = "You are the gpt4o AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: gpt4o."
export const test = { input: '.gpt4o halo', expect: /gpt4o|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('gpt4o.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('gpt4o.notcfg'))
  await ctx.reply(ctx.t('gpt4o.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('gpt4o.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('gpt4o.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('gpt4o.btnReset'), id: '.aireset' }], textFallback: body })
}
