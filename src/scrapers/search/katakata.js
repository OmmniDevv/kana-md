// Kata-kata bijak Bahasa Indonesia dari API Xemoz (endpoint random
// kata-kata, tanpa kunci, terverifikasi hidup dari VM ini: balas
// {"status":"success","data":"<satu kata-kata>"}). Bila sumber ini
// gagal, pemanggil memakai fallback quotes DummyJSON yang sudah ada
// di src/scrapers/search/quotes.js.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

export const KATAKATA_URL = 'https://api-xemoz-official.my.id/api/random/kata-kata.php'

// Urai jawaban Xemoz menjadi satu string kata-kata. Menerima bentuk
// utama { data: "..." } dan variasi { result } / { kata } / objek
// bersarang { data: { kata|quote|text } } seperti referensi Elaina.
export function parseKataKata(json) {
  if (!json || typeof json !== 'object') return null
  if (json.status === false || json.status === 'error') return null
  const raw = json.data ?? json.result ?? json.kata ?? json.quote ?? null
  if (typeof raw === 'string') {
    const text = raw.trim()
    return text ? text : null
  }
  if (raw && typeof raw === 'object') {
    const text = String(raw.kata || raw.quote || raw.text || raw.result || '').trim()
    return text || null
  }
  return null
}

export async function getKataKata({ fetchImpl = fetch } = {}) {
  return withBreaker('xemoz-katakata', () =>
    retry(async () => {
      const res = await fetchImpl(KATAKATA_URL, {
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Xemoz balas HTTP ${res.status}`)
      const parsed = parseKataKata(await res.json())
      if (!parsed) throw new Error('Xemoz tidak mengembalikan kata-kata')
      return parsed
    })
  )
}
