
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "dpsteai",
  alias: [],
  category: "ai",
  description: { id: "Chat dengan AI dari dipastebin.web.id (mendukung session per-user)", en: "KANA version of the Elaina-MD dpsteai feature, rewritten in KANA style" },
  usage: ".dpsteai",
  example: ".dpsteai",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "dpsteai": {
      hint: "╭─❏ 🤖 「 *DPSTEAI* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.dpsteai halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode dpsteai lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "dpsteai": {
      hint: "╭─❏ 🤖 「 *DPSTEAI* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.dpsteai hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, dpsteai mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI dpsteai di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: dpsteai."
const PERSONA_EN = "You are the dpsteai AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: dpsteai."
export const test = { input: '.dpsteai halo', expect: /dpsteai|pikir|thinking/i }
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
