
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "zetavoice",
  alias: [],
  category: "ai",
  description: { id: "Persona chat teks bergaya pengisi suara Zeta di mesin AI KANA (chat teks saja, bukan audio atau suara asli)", en: "Text chat persona in the style of a voice talent named Zeta, on the KANA AI engine (text chat only, not real audio or voice)" },
  usage: ".zetavoice",
  example: ".zetavoice",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "zetavoice": {
      hint: "╭─❏ 🤖 「 *ZETAVOICE* 」\n┊ Ini persona bergaya Zeta Voice di mesin AI KANA, bukan pengisi suara atau layanan suara asli yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.zetavoice ceritakan lelucon pendek tentang robot yang belajar memasak*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Zeta Voice lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "zetavoice": {
      hint: "╭─❏ 🤖 「 *ZETAVOICE* 」\n┊ This is a Zeta Voice styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.zetavoice tell a short joke about a robot learning to cook*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Zeta Voice persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Zeta Voice di bot WhatsApp KANA. Kamu BUKAN pengisi suara atau layanan suara asli; kamu persona bergaya Zeta Voice yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu pengisi suara atau layanan suara asli; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Zeta Voice di KANA. Gaya khasmu: ceria dan ekspresif seperti pengisi suara karakter: jawaban teks yang hidup dan penuh intonasi tertulis, tapi tetap hanya teks, bukan audio. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Zeta Voice in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Zeta Voice styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Zeta Voice styled persona in KANA. Your signature style: cheerful and expressive like a character voice talent: lively written answers full of written intonation, but still text only, not audio. Answer in friendly, helpful English."
export const test = { input: '.zetavoice ceritakan lelucon pendek tentang robot yang belajar memasak', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('zetavoice.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('zetavoice.notcfg'))
  await ctx.reply(ctx.t('zetavoice.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('zetavoice.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('zetavoice.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('zetavoice.btnReset'), id: '.aireset' }], textFallback: body })
}
