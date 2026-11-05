// DINONAKTIFKAN 2026-11-06 (audit templat gelombang 2, klaster AI):
// perintah ini tadinya handler chat teks persona yang TIDAK membaca
// gambar sama sekali, padahal namanya menjanjikan edit gambar.
// Probe VM 2026-11-06 membuktikan tidak ada jalur img2img nyata
// tanpa kunci: image.pollinations.ai mengabaikan parameter image
// (hasil pixel identik dengan generasi teks murni, selisih 0.0),
// sedangkan model edit asli (kontext, nanobanana) membalas
// HTTP 403 karena wajib pollen API key. Gaya gambar lokal yang
// nyata sudah tersedia di .imgstyle (ffmpeg) dan gambar baru di
// .text2img, jadi versi lokal di sini hanya akan jadi duplikat.
// Aktifkan lagi hanya bila ada provider img2img yang terbukti
// mengolah gambar masukan dari VM. Lihat scratch/fix-ai2.md.

import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "tohijab",
  alias: [],
  category: "ai",
  description: { id: "Fitur tohijab versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD tohijab feature, rewritten in KANA style" },
  usage: ".tohijab",
  example: ".tohijab",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "tohijab": {
      hint: "╭─❏ 🤖 「 *TOHIJAB* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.tohijab halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode tohijab lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "tohijab": {
      hint: "╭─❏ 🤖 「 *TOHIJAB* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.tohijab hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, tohijab mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI tohijab di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: tohijab."
const PERSONA_EN = "You are the tohijab AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: tohijab."
export const test = { input: '.tohijab halo', expect: /tohijab|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('tohijab.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('tohijab.notcfg'))
  await ctx.reply(ctx.t('tohijab.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('tohijab.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('tohijab.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('tohijab.btnReset'), id: '.aireset' }], textFallback: body })
}
