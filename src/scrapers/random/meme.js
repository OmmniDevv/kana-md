// Meme acak untuk perintah lahelu. API cuki Elaina untuk lahelu
// sudah mati (balas 401, key tidak berlaku), dan tidak ada endpoint
// publik lahelu lain yang terverifikasi dari VM ini, jadi sumbernya
// diganti meme-api.com/gimme yang terverifikasi hidup: balas
// {title, url, nsfw, subreddit, ...}. Aturan keras: meme NSFW tidak
// pernah dikirim, dan berkas gambar wajib lolos validasi magic bytes
// sebelum dikirim (pola yang sama seperti scraper bluearchive).
import { downloadBuffer, randomUserAgent, retry, withBreaker } from '../runner.js'
import { imageKind } from '../maker/removebg.js'

export const MEME_API_URL = 'https://meme-api.com/gimme'

// Urai jawaban meme-api menjadi { title, url, subreddit } atau null.
// NSFW selalu ditolak di sini, bukan hanya di pemanggil.
export function parseMeme(json) {
  if (!json || typeof json !== 'object') return null
  if (json.nsfw === true) return null
  const url = String(json.url || '').trim()
  if (!/^https:\/\//.test(url)) return null
  return {
    title: String(json.title || 'Meme').trim() || 'Meme',
    url,
    subreddit: String(json.subreddit || '').trim(),
  }
}

export async function getRandomMeme({ fetchImpl = fetch, download = downloadBuffer, attempts = 3 } = {}) {
  return withBreaker('meme-api-gimme', () =>
    retry(async () => {
      let lastError = null
      for (let i = 0; i < attempts; i++) {
        const res = await fetchImpl(MEME_API_URL, {
          signal: AbortSignal.timeout(20000),
          headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`meme-api balas HTTP ${res.status}`)
        const meme = parseMeme(await res.json())
        if (!meme) {
          lastError = new Error('Meme yang datang NSFW atau tidak valid, dicoba lagi')
          continue
        }
        const media = await download(meme.url, { maxBytes: 16 * 1024 * 1024, timeout: 30000 })
        const kind = imageKind(media.buffer)
        if (kind !== 'jpeg' && kind !== 'png' && kind !== 'webp') {
          lastError = new Error('Berkas meme bukan gambar yang valid')
          continue
        }
        return { ...meme, buffer: media.buffer, kind }
      }
      throw lastError || new Error('Tidak ada meme aman yang bisa diambil')
    })
  )
}
