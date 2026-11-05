
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "muslimai",
  alias: [],
  category: "ai",
  description: { id: "AI untuk bertanya tentang Islam dan Al-Quran", en: "KANA version of the Elaina-MD muslimai feature, rewritten in KANA style" },
  usage: ".muslimai",
  example: ".muslimai",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "muslimai": {
      hint: "╭─❏ 🤖 「 *MUSLIMAI* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.muslimai halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode muslimai lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "muslimai": {
      hint: "╭─❏ 🤖 「 *MUSLIMAI* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.muslimai hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, muslimai mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI muslimai di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: muslimai."
const PERSONA_EN = "You are the muslimai AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: muslimai."
export const test = { input: '.muslimai halo', expect: /muslimai|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('muslimai.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('muslimai.notcfg'))
  await ctx.reply(ctx.t('muslimai.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('muslimai.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('muslimai.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('muslimai.btnReset'), id: '.aireset' }], textFallback: body })
}
