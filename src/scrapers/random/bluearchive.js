// Gambar Blue Archive acak dari dua sumber hidup yang terverifikasi
// dari VM ini:
// - barandom: endpoint gambar langsung api.nexray.web.id/random/ba
//   (balas JPEG walau header content-type tertulis image/png, jadi
//   validasi selalu dari magic bytes, bukan header).
// - cosba: API cosplay Blue Archive lama (api.ryuu-dev) sudah mati dari
//   VM ini (fetch failed berulang), diganti DAPI Safebooru dengan tag
//   blue_archive + cosplay + rating:safe. Isinya gambar bertema cosplay
//   Blue Archive (sebagian besar ilustrasi karakter berkostum cosplay),
//   bukan foto cosplayer asli; itu keterbatasan sumber pengganti yang
//   tersedia dan dicatat apa adanya.
import { downloadBuffer, randomUserAgent, retry, withBreaker } from '../runner.js'
import { imageKind } from '../maker/removebg.js'

export const NEXRAY_BA_URL = 'https://api.nexray.web.id/random/ba'
export const SAFEBOORU_API = 'https://safebooru.org/index.php'

export async function getRandomBlueArchiveImage({ fetchImpl = fetch } = {}) {
  return withBreaker('nexray-ba', () =>
    retry(async () => {
      const res = await fetchImpl(NEXRAY_BA_URL, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'image/*' },
      })
      if (!res.ok) throw new Error(`Nexray balas HTTP ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      const kind = imageKind(buffer)
      if (kind !== 'jpeg' && kind !== 'png') throw new Error('Nexray tidak mengembalikan gambar yang valid')
      return { buffer, kind }
    })
  )
}

// Urai jawaban DAPI Safebooru menjadi daftar pos gambar yang bisa
// diunduh: wajib bertag cosplay dan blue_archive, berkas jpg/png, dan
// punya file_url https.
export function parseSafebooruPosts(json) {
  if (!Array.isArray(json)) return []
  const out = []
  for (const post of json) {
    const tags = String(post?.tags || '')
    if (!/(^|\s)cosplay(\s|$)/.test(tags) || !/(^|\s)blue_archive(\s|$)/.test(tags)) continue
    const fileUrl = String(post?.file_url || '')
    if (!/^https:\/\//.test(fileUrl) || !/\.(jpe?g|png)$/i.test(fileUrl)) continue
    out.push({ id: post.id, fileUrl, sampleUrl: String(post?.sample_url || ''), tags })
  }
  return out
}

export async function fetchSafebooruCosplayPosts({ fetchImpl = fetch, page = 0 } = {}) {
  const params = new URLSearchParams({
    page: 'dapi',
    s: 'post',
    q: 'index',
    json: '1',
    limit: '100',
    pid: String(page),
    tags: 'blue_archive cosplay rating:safe',
  })
  const res = await fetchImpl(`${SAFEBOORU_API}?${params}`, {
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Safebooru balas HTTP ${res.status}`)
  return parseSafebooruPosts(await res.json())
}

// Ambil satu gambar cosplay Blue Archive acak: coba beberapa halaman
// acak, acak urutan posnya, unduh kandidat satu per satu sampai ada
// berkas gambar valid (maks 16 MB).
export async function getRandomCosplayImage({ rng = Math.random, fetchImpl = fetch, download = downloadBuffer } = {}) {
  return withBreaker('safebooru-cosba', () =>
    retry(async () => {
      const pages = [Math.floor(rng() * 6), Math.floor(rng() * 6), 0]
      let lastError = null
      for (const page of pages) {
        let posts
        try {
          posts = await fetchSafebooruCosplayPosts({ fetchImpl, page })
        } catch (err) {
          lastError = err
          continue
        }
        const shuffled = [...posts]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.min(i, Math.floor(rng() * (i + 1)))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        for (const post of shuffled.slice(0, 6)) {
          try {
            const media = await download(post.fileUrl, { maxBytes: 16 * 1024 * 1024, timeout: 30000 })
            const kind = imageKind(media.buffer)
            if (kind !== 'jpeg' && kind !== 'png') continue
            return {
              buffer: media.buffer,
              kind,
              postUrl: `https://safebooru.org/index.php?page=post&s=view&id=${post.id}`,
            }
          } catch (err) {
            lastError = err
          }
        }
      }
      throw lastError || new Error('Tidak ada gambar cosplay Blue Archive yang bisa diunduh')
    })
  )
}
