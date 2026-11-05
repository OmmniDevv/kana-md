// DINONAKTIFKAN 2026-11-06 (audit templat gelombang 2, klaster AI):
// perintah ini butuh analisis gambar (vision), tetapi handler
// lamanya hanya chat teks tanpa pernah melihat gambar. Probe VM
// 2026-11-06: text.pollinations.ai/models tier anonim hanya
// menyediakan openai-fast dengan vision: false; POST /openai
// berisi image_url membalas HTTP 400 "This model does not
// support image input"; api.llm7.io balas model_unavailable.
// Jalur vision resmi tetap .vision bila owner mengisi env
// VISION_API_URL. Aktifkan lagi bila ada provider vision gratis
// yang terbukti menjawab dari gambar uji asli di VM.
// Lihat scratch/fix-ai2.md.

import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "kimi-vision",
  alias: [],
  category: "ai",
  description: { id: "Fitur kimi-vision versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD kimi-vision feature, rewritten in KANA style" },
  usage: ".kimi-vision",
  example: ".kimi-vision",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "kimi-vision": {
      hint: "╭─❏ 🤖 「 *KIMI-VISION* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.kimi-vision halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode kimi-vision lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "kimi-vision": {
      hint: "╭─❏ 🤖 「 *KIMI-VISION* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.kimi-vision hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, kimi-vision mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI kimi-vision di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: kimi-vision."
const PERSONA_EN = "You are the kimi-vision AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: kimi-vision."
export const test = { input: '.kimi-vision halo', expect: /kimi-vision|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('kimi-vision.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('kimi-vision.notcfg'))
  await ctx.reply(ctx.t('kimi-vision.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('kimi-vision.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('kimi-vision.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('kimi-vision.btnReset'), id: '.aireset' }], textFallback: body })
}
