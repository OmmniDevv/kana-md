// Deteksi gambar AI via ZeroGPT aiImageDetect.
// Diadaptasi dari snippet "Ai image detector" by FruatreMaou (kiriman user 2026-11-05),
// ditulis ulang gaya KANA (multipart manual tanpa form-data, input URL atau gambar kutipan).
// ZeroGPT terbukti flaky dari VM ini (probe 2026-11-05): kadang membalas
// HTTP 200 dengan success:false "Unable to verify content moderation",
// kadang menggantung lama (GAGAL timeout 120 detik di irisan P2). Karena
// itu panggilan dibatasi 40 detik, dicoba sampai 2 kali, dan payload
// success:false diperlakukan sebagai kegagalan layanan, bukan hasil.
import axios from 'axios'
import { downloadBuffer, sleep } from '../../src/scrapers/runner.js'

export const config = {
  name: "aidetect",
  alias: [],
  category: "ai",
  description: { id: "Deteksi apakah gambar dibuat AI atau asli pakai ZeroGPT", en: "Detect whether an image was made by AI or is real, using ZeroGPT" },
  usage: ".aidetect <url gambar> atau balas gambar",
  example: ".aidetect https://picsum.photos/400/600.jpg",
  cooldown: 10,
  premium: true,
}

export const i18n = {
  id: {
    "aidetect": {
      hint: "╭─❏ 🖼️ 「 *DETEKSI GAMBAR AI* 」\n┊ Kirim URL gambarnya, atau balas sebuah gambar yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.aidetect https://picsum.photos/400/600.jpg*\n╰━━━━━━━",
      working: "╭─❏ 🖼️ 「 *LAGI MENDETEKSI* 」\n┊ Sebentar, gambarnya lagi dianalisis dulu yaa... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🖼️ 「 *HASIL DETEKSI GAMBAR AI* 」\n┊ {detail}\n╰━━━━━━━",
      badsize: "╭─❏ 💦 「 *UKURAN TIDAK PAS* 」\n┊ Gambarnya harus antara 1 KB dan 10 MB yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *DETEKSI GAGAL* 」\n┊ Mouu, deteksinya gagal: *{message}*\n┊ Layanan ZeroGPT lagi bermasalah atau gambarnya tidak bisa dijangkau, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "aidetect": {
      hint: "╭─❏ 🖼️ 「 *AI IMAGE DETECTOR* 」\n┊ Send the image URL, or reply to an image~\n┊ ᴇxᴀᴍᴘʟᴇ: *.aidetect https://picsum.photos/400/600.jpg*\n╰━━━━━━━",
      working: "╭─❏ 🖼️ 「 *DETECTING* 」\n┊ One sec, analyzing the image... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🖼️ 「 *AI IMAGE DETECTION RESULT* 」\n┊ {detail}\n╰━━━━━━━",
      badsize: "╭─❏ 💦 「 *WRONG SIZE* 」\n┊ The image must be between 1 KB and 10 MB~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *DETECTION FAILED* 」\n┊ Mouu, the detection failed: *{message}*\n┊ The ZeroGPT service is having trouble or the image is unreachable, try again later~\n╰━━━━━━━",
    },
  },
}

async function postToZeroGpt(body, boundary) {
  const res = await axios.post('https://api.zerogpt.com/api/image/aiImageDetect', body, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Origin: 'https://www.zerogpt.com',
      Referer: 'https://www.zerogpt.com/ai-image-detector',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
    },
    timeout: 40000,
    maxContentLength: 16 * 1024 * 1024,
    maxBodyLength: 16 * 1024 * 1024,
  })
  return res.data
}

export async function detectAiImage(buffer, filename = 'image.jpg', mimeType = 'image/jpeg', { postImpl = postToZeroGpt, attempts = 2 } = {}) {
  if (buffer.length < 1024) throw new Error('file terlalu kecil (minimal 1 KB)')
  if (buffer.length > 10 * 1024 * 1024) throw new Error('file terlalu besar (maksimal 10 MB)')
  const boundary = '----KanaFormBoundary' + Date.now().toString(16)
  const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`)
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`)
  const body = Buffer.concat([head, Buffer.from(buffer), tail])
  let lastErr = null
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const data = await postImpl(body, boundary)
      if (!data || data.success === false) {
        throw new Error(data?.message || 'layanan deteksi menolak gambar')
      }
      return data
    } catch (err) {
      lastErr = err
      if (attempt < attempts) await sleep(1500)
    }
  }
  throw lastErr
}

function flat(obj, prefix = '', out = []) {
  if (obj === null || obj === undefined || out.length >= 12) return out
  if (typeof obj !== 'object') { out.push((prefix ? prefix + ': ' : '') + String(obj).slice(0, 200)); return out }
  if (Array.isArray(obj)) { obj.slice(0, 4).forEach((v, i) => flat(v, prefix + (i + 1), out)); return out }
  for (const [k, v] of Object.entries(obj).slice(0, 12)) {
    if (v && typeof v === 'object') flat(v, k, out)
    else if (v !== null && v !== undefined && v !== '') out.push('*' + k + '*: ' + String(v).slice(0, 200))
    if (out.length >= 12) break
  }
  return out
}

export const test = { input: '.aidetect https://picsum.photos/400/600.jpg', expect: /HASIL DETEKSI|DETECTION RESULT/ }
export async function handler(ctx) {
  const url = ((ctx.text || '').match(/https?:\/\/[^\s]+/) || [])[0]
  let buffer = null
  let mime = 'image/jpeg'
  try {
    if (url) {
      const media = await downloadBuffer(url, { maxBytes: 10 * 1024 * 1024, timeout: 30000 })
      buffer = media.buffer
      mime = media.contentType || mime
    } else if (ctx.quoted?.message?.imageMessage) {
      buffer = await ctx.downloadQuoted()
      mime = ctx.quoted.message.imageMessage.mimetype || mime
    }
  } catch (err) {
    return ctx.reply(ctx.t('aidetect.fail', { message: err.message }))
  }
  if (!buffer) return ctx.reply(ctx.t('aidetect.hint'))
  if (buffer.length < 1024 || buffer.length > 10 * 1024 * 1024) return ctx.reply(ctx.t('aidetect.badsize'))
  await ctx.reply(ctx.t('aidetect.working', { mood: ctx.say('mikir') }))
  try {
    const data = await detectAiImage(buffer, 'image.jpg', mime)
    const detail = flat(data?.data ?? data).join('\n┊ ') || '-'
    return ctx.reply(ctx.t('aidetect.result', { detail }))
  } catch (err) {
    return ctx.reply(ctx.t('aidetect.fail', { message: 'HTTP ' + (err.response?.status || err.message) }))
  }
}
