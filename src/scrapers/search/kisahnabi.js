// Kisah nabi versi PENUH dari Wikipedia bahasa Indonesia (API extracts
// teks polos). Dataset lokal lama cuma 100-235 karakter per nabi, terlalu
// pendek; artikel Wikipedia memuat kisah lengkap lahir sampai wafat
// (Muhammad sekitar 45 ribu karakter). Fallback terakhir: kisah ringkas
// lokal dari src/data/religi.js supaya perintah tidak pernah mati total.
import { randomUserAgent, retry, withBreaker } from '../runner.js'
import { KISAH_NABI } from '../../data/religi.js'

// Nama lokal (religi.js) ke judul artikel Wikipedia bahasa Indonesia.
export const WIKI_TITLES = {
  Adam: 'Adam',
  Idris: 'Idris',
  Nuh: 'Nuh',
  Hud: 'Hud',
  Shaleh: 'Saleh',
  Ibrahim: 'Ibrahim',
  Luth: 'Lut',
  Ismail: 'Ismail',
  Ishaq: 'Ishak',
  Yakub: 'Yakub',
  Yusuf: 'Yusuf',
  Ayyub: "Ayub (tokoh Al-Qur'an)",
  Syuaib: "Syu'aib",
  Musa: 'Musa',
  Harun: 'Harun',
  Dzulkifli: 'Zulkifli',
  Daud: 'Daud',
  Sulaiman: 'Sulaiman',
  Ilyas: 'Ilyas',
  Ilyasa: 'Ilyasa',
  Yunus: 'Yunus',
  Zakaria: 'Zakariyya',
  Yahya: 'Yahya',
  Isa: 'Isa',
  Muhammad: 'Muhammad',
}

const API = 'https://id.wikipedia.org/w/api.php'

// Buang seksi ekor khas artikel Wikipedia (referensi, pranala, dsb.) dan
// rapikan baris kosong berlebih. Judul seksi (== Judul ==) dipertahankan
// sebagai penanda alur kisah.
export function cleanExtract(text) {
  let out = String(text || '')
  const cutMarkers = [
    '\n== Referensi ==',
    '\n== Catatan kaki ==',
    '\n== Lihat juga ==',
    '\n== Pranala luar ==',
    '\n== Bibliografi ==',
    '\n== Sumber ==',
  ]
  for (const marker of cutMarkers) {
    const idx = out.indexOf(marker)
    if (idx > 0) out = out.slice(0, idx)
  }
  return out.replace(/\n{3,}/g, '\n\n').trim()
}

async function fetchExtract(title) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    explaintext: '1',
    redirects: '1',
    format: 'json',
    formatversion: '2',
    titles: title,
  })
  const res = await fetch(`${API}?${params}`, {
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Wikipedia balas HTTP ${res.status}`)
  const json = await res.json()
  const page = json?.query?.pages?.[0]
  if (!page || page.missing || !page.extract) return null
  const text = cleanExtract(page.extract)
  return text.length >= 800 ? { title: page.title, text } : null
}

// Ambil kisah full satu nabi. Mengembalikan { nama, title, text, source }
// dengan source 'wikipedia' atau 'lokal' (fallback ringkas).
export async function getKisahFull(nama) {
  const item = KISAH_NABI.find((x) => x.nama.toLowerCase() === String(nama || '').toLowerCase())
  if (!item) return null
  const title = WIKI_TITLES[item.nama]
  if (title) {
    try {
      const full = await withBreaker('wikipedia-kisah', () => retry(() => fetchExtract(title), { retries: 2, baseDelay: 1200 }))
      if (full) return { nama: item.nama, title: full.title, text: full.text, source: 'wikipedia' }
    } catch {
      // jatuh ke fallback lokal di bawah
    }
  }
  return { nama: item.nama, title: item.nama, text: item.kisah, source: 'lokal' }
}

// Pecah teks panjang jadi potongan pesan berurutan (maks per potongan),
// memotong di batas paragraf sebisa mungkin supaya enak dibaca.
export function splitStory(text, max = 3000) {
  const clean = String(text || '').trim()
  if (clean.length <= max) return [clean]
  const parts = []
  let rest = clean
  while (rest.length > max) {
    let cut = rest.lastIndexOf('\n\n', max)
    if (cut < max * 0.5) cut = rest.lastIndexOf('\n', max)
    if (cut < max * 0.5) {
      const dot = rest.lastIndexOf('. ', max)
      if (dot >= max * 0.5) cut = dot + 1
    }
    if (cut < max * 0.5) cut = max
    parts.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trim()
  }
  if (rest) parts.push(rest)
  return parts
}
