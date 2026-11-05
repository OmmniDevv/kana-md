
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "glm4",
  alias: [],
  category: "ai",
  description: { id: "Chat dengan GLM 4.6V", en: "KANA version of the Elaina-MD glm4 feature, rewritten in KANA style" },
  usage: ".glm4",
  example: ".glm4",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "glm4": {
      hint: "╭─❏ 🤖 「 *GLM4* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.glm4 halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode glm4 lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "glm4": {
      hint: "╭─❏ 🤖 「 *GLM4* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.glm4 hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, glm4 mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI glm4 di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: glm4."
const PERSONA_EN = "You are the glm4 AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: glm4."
export const test = { input: '.glm4 halo', expect: /glm4|pikir|thinking/i }
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
