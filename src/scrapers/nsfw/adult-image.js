// Sumber gambar anime dewasa (publik, tokoh dewasa) untuk keluarga
// perintah waifu 18+ premium. Ditulis untuk port RYO-YAMADA-MD
// plugins/nsfw/waifu.js atas perintah owner 2026-11-05.
//
// Sumber asli RYO, api.waifu.im, TIDAK terjangkau dari VM KANA (probe
// 2026-11-05: koneksi gagal total, HTTP 000; api.waifu.pics sama), jadi
// diganti sumber yang terverifikasi hidup dari VM pada tanggal yang sama:
// - NekosAPI (api.nekosapi.com): API gambar anime terkurasi, filter
//   rating=explicit; berkas WebP terverifikasi magic RIFF/WebP.
// - Konachan (konachan.com/post.json): booru publik dengan query tag.
//   Wajib rating:e plus pengecualian tag berbahaya di query DAN saringan
//   tag pada hasil (pertahanan berlapis: pos bertanda loli/shota/anak
//   tidak pernah diteruskan, apa pun sumbernya).
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// Kata tag yang membuat sebuah pos DITOLAK tanpa pengecualian.
export const BLOCKED_TAG_WORDS = ['loli', 'shota']

export function isSafePost(tags) {
  const tokens = String(tags ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  for (const token of tokens) {
    for (const word of BLOCKED_TAG_WORDS) {
      if (token.includes(word)) return false
    }
    if (token === 'child' || token === 'children' || token === 'toddler' || token === 'young') return false
  }
  return true
}

export function parseNekosapi(json) {
  const item = Array.isArray(json) ? json[0] : null
  if (!item || typeof item.url !== 'string' || !item.url) return null
  if (item.rating && item.rating !== 'explicit') return null
  return { url: item.url, tags: Array.isArray(item.tags) ? item.tags.join(' ') : '', source: 'nekosapi' }
}

export function pickKonachanPost(posts) {
  if (!Array.isArray(posts)) return null
  for (const post of posts) {
    if (!post || post.rating !== 'e') continue
    if (!isSafePost(post.tags)) continue
    const url = post.jpeg_url || post.sample_url || post.file_url
    if (typeof url === 'string' && url) return { url, tags: String(post.tags ?? ''), source: 'konachan' }
  }
  return null
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

export async function nekosapiExplicit() {
  const json = await fetchJson('https://api.nekosapi.com/v4/images/random?rating=explicit&limit=1')
  const parsed = parseNekosapi(json)
  if (!parsed) throw new Error('NekosAPI membalas kosong')
  return parsed
}

export async function konachanImage(tagQuery = '') {
  const page = 1 + Math.floor(Math.random() * 10)
  const tags = [tagQuery, 'rating:e', '-loli', '-shota'].filter(Boolean).join(' ')
  const url = `https://konachan.com/post.json?limit=10&page=${page}&tags=${encodeURIComponent(tags)}`
  const posts = await fetchJson(url, { 'User-Agent': UA })
  const picked = pickKonachanPost(posts)
  if (!picked) throw new Error('Konachan tidak memberi pos yang lolos saringan')
  return picked
}

// Rantai sumber per jenis perintah. Tiap jenis mengembalikan
// { url, source, tags } gambar dewasa yang sudah lolos saringan.
const CHAINS = {
  waifunsfw: [() => nekosapiExplicit(), () => konachanImage('breasts')],
  hentai: [() => konachanImage(''), () => nekosapiExplicit()],
  oppai: [() => konachanImage('oppai'), () => nekosapiExplicit()],
  // Konachan dan yande.re tidak punya tag milf yang berbuah (probe
  // 2026-11-05: 0 pos), jadi milf memakai kolam explicit NekosAPI.
  milf: [() => nekosapiExplicit(), () => konachanImage('breasts')],
}

export async function fetchAdultImage(kind) {
  const chain = CHAINS[kind]
  if (!chain) throw new Error('Jenis gambar dewasa tidak dikenal: ' + kind)
  let lastError = null
  for (const step of chain) {
    try {
      return await step()
    } catch (err) {
      lastError = err
    }
  }
  throw lastError ?? new Error('Semua sumber gambar dewasa gagal')
}
