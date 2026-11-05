// .vision: analisis gambar yang dikutip.
//
// Kejujuran fitur: Pollinations teks publik tidak menerima gambar
// secara andal dan rudder.chat di proyek ini teks saja, jadi TIDAK
// ada provider vision bawaan. Plugin ini tidak pura-pura bisa
// menganalisis. Struktur siap pakai: bila owner mengisi env
// VISION_API_URL (endpoint kompatibel chat-completions bergaya OpenAI
// yang menerima image_url berupa data URI, tanpa key bawaan di repo),
// gambar dikirim ke sana lewat POST JSON. Tanpa env itu, pengguna
// dibalas jujur bahwa vision belum terkonfigurasi di rilis ini.
import { assertSafeUrl } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'vision',
  premium: true,
  alias: ['lihatgambar', 'analisagambar'],
  category: 'ai',
  description: { id: 'Analisis gambar yang dikutip (butuh konfigurasi owner)', en: 'Analyze a quoted image (needs owner configuration)' },
  usage: '.vision (balas gambar)',
  example: '.vision',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    vision: {
      needImage: '╭─❏ 👀 「 *BALAS GAMBARNYA DULU* 」\n┊ Balas gambar yang mau KANA lihat dulu yaa, baru ketik *.vision*~\n╰━━━━━━━',
      tooBig: '╭─❏ 💦 「 *GAMBAR KEGADEAN* 」\n┊ Aduh, gambarnya kegedean nih (di atas *4 MB*).\n┊ Coba gambar yang lebih kecil ya~\n╰━━━━━━━',
      downloadFailed: '╭─❏ 💦 「 *GAMBAR GAGAL DIUNDUH* 」\n┊ Mouu, KANA gagal mengunduh gambarnya: *{message}*\n┊ Coba kirim ulang gambarnya ya~\n╰━━━━━━━',
      notConfigured:
        '╭─❏ ⚙️ 「 *VISION BELUM DIKONFIGURASI* 」\n┊ Mouu, fitur lihat gambar belum terkonfigurasi di rilis ini (╥﹏╥)\n┊ Provider vision gratis yang andal belum ada, jadi KANA nggak mau pura-pura menganalisis gambar kamu.\n┊ Master bisa mengaktifkan lewat *VISION_API_URL* di .env nanti yaa~\n╰━━━━━━━',
      analyzing: '╭─❏ 👀 「 *LAGI DILIHAT* 」\n┊ Hmm, KANA lihat gambarnya dulu yaa... {mood} ✨\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *ANALISIS GAGAL* 」\n┊ Mouu, analisis gambarnya gagal: *{message}*\n┊ Coba lagi nanti ya~ (╥﹏╥)\n╰━━━━━━━',
      empty: '╭─❏ 💭 「 *HASIL KOSONG* 」\n┊ Ehh? Hasil analisisnya kosong.\n┊ Coba gambar lain ya~\n╰━━━━━━━',
      resultHeader: '╭─❏ 👀 「 *HASIL LIHAT GAMBAR* 」\n╰━━━━━━━',
      describePrompt: 'Deskripsikan gambar ini dengan detail dalam Bahasa Indonesia. Sebutkan objek utama, warna, suasana, dan teks yang terlihat bila ada.',
      btnAi: 'Ngobrol AI',
    },
  },
  en: {
    vision: {
      needImage: '╭─❏ 👀 「 *REPLY TO THE IMAGE FIRST* 」\n┊ Reply to the image you want KANA to look at first, then type *.vision*~\n╰━━━━━━━',
      tooBig: '╭─❏ 💦 「 *IMAGE TOO BIG* 」\n┊ Oops, the image is too big (over *4 MB*).\n┊ Try a smaller image~\n╰━━━━━━━',
      downloadFailed: '╭─❏ 💦 「 *IMAGE DOWNLOAD FAILED* 」\n┊ Mouu, KANA failed to download the image: *{message}*\n┊ Please resend the image~\n╰━━━━━━━',
      notConfigured:
        '╭─❏ ⚙️ 「 *VISION NOT CONFIGURED* 」\n┊ Mouu, the image vision feature is not configured in this release (╥﹏╥)\n┊ There is no reliable free vision provider yet, so KANA will not pretend to analyze your image.\n┊ Master can enable it later via *VISION_API_URL* in .env~\n╰━━━━━━━',
      analyzing: '╭─❏ 👀 「 *LOOKING AT IT* 」\n┊ Hmm, KANA is looking at the image... {mood} ✨\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *ANALYSIS FAILED* 」\n┊ Mouu, image analysis failed: *{message}*\n┊ Try again later~ (╥﹏╥)\n╰━━━━━━━',
      empty: '╭─❏ 💭 「 *EMPTY RESULT* 」\n┊ Eh? The analysis came back empty.\n┊ Try another image~\n╰━━━━━━━',
      resultHeader: '╭─❏ 👀 「 *WHAT KANA SEES* 」\n╰━━━━━━━',
      describePrompt: 'Describe this image in detail in English. Mention the main objects, colors, mood, and any visible text.',
      btnAi: 'Chat AI',
    },
  },
}

const MAX_VISION_BYTES = 4 * 1024 * 1024

export const test = { input: '.vision', expect: /gambar/i }

export async function handler(ctx) {
  const quotedMessage = ctx.quoted?.message
  const imageMessage = quotedMessage?.imageMessage
  if (!imageMessage) return ctx.reply(ctx.t('vision.needImage'))

  const apiUrl = (process.env.VISION_API_URL || '').trim()
  if (!apiUrl) {
    const body = ctx.t('vision.notConfigured')
    return sendButtons(ctx.sock, ctx.chat, {
      title: process.env.BOT_NAME || 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('vision.btnAi'), id: '.ai' }],
      textFallback: body,
    })
  }

  let buffer
  try {
    buffer = await ctx.downloadQuoted()
  } catch (err) {
    return ctx.reply(ctx.t('vision.downloadFailed', { message: err.message }))
  }
  if (!buffer || buffer.length > MAX_VISION_BYTES) return ctx.reply(ctx.t('vision.tooBig'))

  await ctx.reply(ctx.t('vision.analyzing', { mood: ctx.say('mikir') }))
  const mime = imageMessage.mimetype || 'image/jpeg'
  const dataUri = `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`
  let answer
  try {
    const safe = assertSafeUrl(apiUrl)
    const res = await fetch(safe.href, {
      method: 'POST',
      signal: AbortSignal.timeout(60000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.VISION_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: ctx.t('vision.describePrompt') },
              { type: 'image_url', image_url: { url: dataUri } },
            ],
          },
        ],
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    answer = String(json?.choices?.[0]?.message?.content || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('vision.failed', { message: err.message }))
  }
  if (!answer) return ctx.reply(ctx.t('vision.empty'))
  const body = `${ctx.t('vision.resultHeader')}\n\n${answer.slice(0, 3500)}`
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('vision.btnAi'), id: '.ai' }],
    textFallback: body,
  })
}
