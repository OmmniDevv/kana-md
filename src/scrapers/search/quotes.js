// Quotes acak dari DummyJSON (endpoint /quotes/random, tanpa kunci,
// terverifikasi hidup dari VM ini). API quotesimage lama (Neoxr)
// memakai API key hardcoded milik bot lain di referensi Elaina, jadi
// tidak dipakai; teks quotes diambil dari sumber hidup ini lalu
// dirender lokal menjadi gambar oleh pemanggil.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

export const RANDOM_QUOTE_URL = 'https://dummyjson.com/quotes/random'

export function parseRandomQuote(json) {
  const quote = String(json?.quote || '').trim()
  const author = String(json?.author || '').trim()
  if (!quote || !author) return null
  return { quote, author }
}

export async function getRandomQuote({ fetchImpl = fetch } = {}) {
  return withBreaker('dummyjson-quotes', () =>
    retry(async () => {
      const res = await fetchImpl(RANDOM_QUOTE_URL, {
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`DummyJSON balas HTTP ${res.status}`)
      const parsed = parseRandomQuote(await res.json())
      if (!parsed) throw new Error('DummyJSON tidak mengembalikan quotes')
      return parsed
    })
  )
}
