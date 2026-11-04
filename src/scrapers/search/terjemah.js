// Scraper terjemahan lewat endpoint publik Google Translate (client gtx,
// tanpa key). Respons berupa array bersarang; parser menggabungkan segmen
// hasil dan membaca bahasa sumber yang terdeteksi.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

const BASE = 'https://translate.googleapis.com/translate_a/single'

export function parseTranslateResponse(data) {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null
  const text = data[0].map((seg) => (Array.isArray(seg) ? seg[0] || '' : '')).join('')
  if (!text) return null
  return { text, detectedLang: data[2] || 'auto' }
}

export async function translateText(text, target) {
  const input = String(text || '').trim()
  const tl = String(target || '').trim().toLowerCase()
  if (!input) throw new Error('Teks wajib diisi')
  if (!tl) throw new Error('Kode bahasa tujuan wajib diisi')
  return withBreaker('google-translate', () =>
    retry(async () => {
      const params = new URLSearchParams({ client: 'gtx', sl: 'auto', tl, dt: 't', q: input })
      const res = await fetch(`${BASE}?${params}`, {
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Google Translate balas HTTP ${res.status}`)
      let data
      try {
        data = await res.json()
      } catch {
        throw new Error('Google Translate membalas halaman blokir, bukan data')
      }
      const parsed = parseTranslateResponse(data)
      if (!parsed) throw new Error('Hasil terjemahan kosong')
      return { ...parsed, target: tl }
    })
  )
}
