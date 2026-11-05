
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "dolphin",
  alias: [],
  category: "ai",
  description: { id: "Chat dengan Dolphin AI (24B Model)", en: "KANA version of the Elaina-MD dolphin feature, rewritten in KANA style" },
  usage: ".dolphin",
  example: ".dolphin",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "dolphin": {
      hint: "╭─❏ 🤖 「 *DOLPHIN* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.dolphin halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode dolphin lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "dolphin": {
      hint: "╭─❏ 🤖 「 *DOLPHIN* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.dolphin hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, dolphin mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI dolphin di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: dolphin."
const PERSONA_EN = "You are the dolphin AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: dolphin."
export const test = { input: '.dolphin halo', expect: /dolphin|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('dolphin.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('dolphin.notcfg'))
  await ctx.reply(ctx.t('dolphin.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('dolphin.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('dolphin.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('dolphin.btnReset'), id: '.aireset' }], textFallback: body })
}
