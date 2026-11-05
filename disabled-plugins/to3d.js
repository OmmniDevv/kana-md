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
  name: "to3d",
  alias: [],
  category: "ai",
  description: { id: "Ubah foto menjadi gaya 3D render", en: "KANA version of the Elaina-MD to3d feature, rewritten in KANA style" },
  usage: ".to3d",
  example: ".to3d",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "to3d": {
      hint: "╭─❏ 🤖 「 *TO3D* 」\n┊ Tulis pesan atau pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.to3d halo, apa kabar*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, mode to3d lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "to3d": {
      hint: "╭─❏ 🤖 「 *TO3D* 」\n┊ Write your message or question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.to3d hello, how are you*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, to3d mode is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah fitur AI to3d di bot WhatsApp KANA. Jawab pertanyaan user dalam Bahasa Indonesia yang ramah, ringkas, dan membantu. Topik fokusmu: to3d."
const PERSONA_EN = "You are the to3d AI feature of the KANA WhatsApp bot. Answer the user in friendly, concise, helpful English. Your focus topic: to3d."
export const test = { input: '.to3d halo', expect: /to3d|pikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('to3d.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('to3d.notcfg'))
  await ctx.reply(ctx.t('to3d.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('to3d.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('to3d.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('to3d.btnReset'), id: '.aireset' }], textFallback: body })
}
