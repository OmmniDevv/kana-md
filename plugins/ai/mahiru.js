
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "mahiru",
  alias: [],
  category: "ai",
  description: { id: "Fitur mahiru versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD mahiru feature, rewritten in KANA style" },
  usage: ".mahiru",
  example: ".mahiru",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "mahiru": {
      hint: "╭─❏ 🤖 「 *MAHIRU* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.mahiru halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode mahiru lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "mahiru": {
      hint: "╭─❏ 🤖 「 *MAHIRU* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.mahiru hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, mahiru mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI mahiru di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: mahiru."
const PERSONA_EN = "You are the mahiru AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: mahiru."
export const test = { input: '.mahiru halo', expect: /mahiru|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('mahiru.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('mahiru.notcfg'))
  await ctx.reply(ctx.t('mahiru.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('mahiru.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('mahiru.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('mahiru.btnReset'), id: '.aireset' }], textFallback: body })
}
