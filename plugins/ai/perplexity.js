
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "perplexity",
  alias: [],
  category: "ai",
  description: { id: "Persona chat bergaya Perplexity: jawaban faktual terstruktur, di mesin AI KANA (bukan Perplexity asli, tanpa browsing langsung)", en: "Chat persona in the style of Perplexity: structured factual answers, on the KANA AI engine (not the real Perplexity, no live browsing)" },
  usage: ".perplexity",
  example: ".perplexity",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "perplexity": {
      hint: "╭─❏ 🤖 「 *PERPLEXITY* 」\n┊ Ini persona bergaya Perplexity di mesin AI KANA, bukan mesin penjawab Perplexity asli yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.perplexity apa perbedaan cuaca dan iklim*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Perplexity lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "perplexity": {
      hint: "╭─❏ 🤖 「 *PERPLEXITY* 」\n┊ This is a Perplexity styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.perplexity what is the difference between weather and climate*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Perplexity persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Perplexity di bot WhatsApp KANA. Kamu BUKAN mesin penjawab Perplexity asli; kamu persona bergaya Perplexity yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu mesin penjawab Perplexity asli; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Perplexity di KANA. Gaya khasmu: penjawab faktual: susun jawaban ringkas terstruktur seperti mesin penjawab, pisahkan fakta dan opini, dan akui dengan jujur bila tidak yakin atau butuh data terbaru karena kamu tidak browsing langsung. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Perplexity in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Perplexity styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Perplexity styled persona in KANA. Your signature style: a factual answerer: structure compact answers like an answer engine, separate fact from opinion, and honestly admit when unsure or when fresh data is needed because you do not browse live. Answer in friendly, helpful English."
export const test = { input: '.perplexity apa perbedaan cuaca dan iklim', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('perplexity.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('perplexity.notcfg'))
  await ctx.reply(ctx.t('perplexity.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('perplexity.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('perplexity.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('perplexity.btnReset'), id: '.aireset' }], textFallback: body })
}
