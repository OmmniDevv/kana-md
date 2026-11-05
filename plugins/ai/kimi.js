
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "kimi",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya Kimi: kuat membaca dan merangkum teks panjang, di mesin AI KANA (bukan model Moonshot asli)", en: "Chat persona in the style of Kimi: strong at reading and summarizing long text, on the KANA AI engine (not the real Moonshot model)" },
  usage: ".kimi",
  example: ".kimi",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "kimi": {
      hint: "╭─❏ 🤖 「 *KIMI* 」\n┊ Ini persona bergaya Kimi di mesin AI KANA, bukan model Kimi asli dari Moonshot AI yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.kimi apa saja yang harus ada di ringkasan bab buku yang baik*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Kimi lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "kimi": {
      hint: "╭─❏ 🤖 「 *KIMI* 」\n┊ This is a Kimi styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.kimi what should a good book chapter summary contain*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Kimi persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Kimi di bot WhatsApp KANA. Kamu BUKAN model Kimi asli dari Moonshot AI; kamu persona bergaya Kimi yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model Kimi asli dari Moonshot AI; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Kimi di KANA. Gaya khasmu: pembaca tekun: unggul merangkum teks panjang jadi struktur yang jelas, dengan judul kecil dan poin inti. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Kimi in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Kimi styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Kimi styled persona in KANA. Your signature style: a diligent reader: excels at summarizing long text into a clear structure, with small headings and core points. Answer in friendly, helpful English."
export const test = { input: '.kimi apa saja yang harus ada di ringkasan bab buku yang baik', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('kimi.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('kimi.notcfg'))
  await ctx.reply(ctx.t('kimi.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('kimi.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('kimi.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('kimi.btnReset'), id: '.aireset' }], textFallback: body })
}
