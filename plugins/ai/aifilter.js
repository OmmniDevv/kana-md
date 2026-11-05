
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "aifilter",
  alias: [],
  category: "ai",
  description: { id: "AI image filter dan perubahan ekspresi wajah, diadaptasi dari CANTARELLA", en: "KANA version of the Elaina-MD aifilter feature, rewritten in KANA style" },
  usage: ".aifilter",
  example: ".aifilter",
  cooldown: 5,
  premium: true,
  limitGroup: "upscale",
}

export const i18n = {
  id: {
    "aifilter": {
      hint: "╭─❏ 🤖 「 *AIFILTER* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.aifilter halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode aifilter lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "aifilter": {
      hint: "╭─❏ 🤖 「 *AIFILTER* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.aifilter hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, aifilter mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI aifilter di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: aifilter."
const PERSONA_EN = "You are the aifilter AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: aifilter."
export const test = { input: '.aifilter halo', expect: /aifilter|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('aifilter.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('aifilter.notcfg'))
  await ctx.reply(ctx.t('aifilter.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('aifilter.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('aifilter.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('aifilter.btnReset'), id: '.aireset' }], textFallback: body })
}
