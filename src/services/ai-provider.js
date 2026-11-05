// Provider AI terpadu untuk plugin AI.
// Urutan pilihan:
// 1. rudder.chat, hanya bila owner sudah mengisi env rudder (opt-in).
//    Lihat src/scrapers/ai/rudder.js: ekspornya rudderChat(pesan) dan
//    isRudderConfigured(). rudderChat hanya menerima satu string, jadi
//    riwayat pesan dirangkai dulu jadi satu prompt teks.
// 2. Rantai fallback Pollinations teks publik tanpa key. Dua jalur
//    endpoint yang berbeda pada layanan yang sama, masing-masing dengan
//    circuit breaker sendiri di src/scrapers/runner.js:
//    a. POST https://text.pollinations.ai/openai (format OpenAI,
//       model 'openai'). Jalur modern yang direkomendasikan vendor dan
//       terverifikasi menjawab dari VM ini pada 2026-11-05.
//    b. GET https://text.pollinations.ai/<prompt> (jalur klasik).
//    Insiden 2026-11-05: jalur GET klasik timeout total dari VM ini
//    sampai breaker 'pollinations-text' terbuka dan SEMUA plugin AI
//    mati bersama karena hanya ada satu sumber. Sekarang kegagalan
//    satu jalur otomatis lanjut ke jalur berikutnya; pesan error
//    "semua sumber gagal" hanya muncul bila seluruh rantai gagal.
//    Kandidat sumber lain yang sudah diprobe dari VM ini dan GUGUR
//    (jangan dipasang tanpa probe ulang): gen.pollinations.ai (wajib
//    API key, HTTP 401), DuckDuckGo AI Chat (challenge anti-bot 418),
//    api.siputzx.my.id rute AI (404), api.llm7.io jalur anonim (kuota
//    harian bersama habis, HTTP 429), OVH AI Endpoints (wajib OAuth).
// Provider selalu punya field name. Rantai bawaan memakai name
// 'pollinations' (nama keluarga sumbernya), sumber di dalamnya
// terekspos lewat field sources untuk pengujian dan diagnosis.
// Bila jaringan gagal, chat() melempar error dan handler yang membalas
// jujur ke pengguna. Tidak ada provider lain yang dikarang di sini.
import { rudderChat, isRudderConfigured } from '../scrapers/ai/rudder.js'
import { assertSafeUrlResolved, downloadBuffer, randomUserAgent, withBreaker } from '../scrapers/runner.js'

export const AI_MAX_PROMPT_CHARS = 4000
export const AI_MAX_REPLY_CHARS = 4000

// Rangkai messages [{ role, content }] jadi satu prompt teks.
// system ditulis apa adanya sebagai konteks, sisanya berformat
// 'User: ...' dan 'Assistant: ...'. Hasil dipotong 4000 karakter
// dari belakang supaya giliran terbaru tidak hilang.
export function messagesToPrompt(messages) {
  const lines = []
  for (const m of messages ?? []) {
    const content = String(m?.content ?? '').trim()
    if (!content) continue
    if (m.role === 'assistant') lines.push(`Assistant: ${content}`)
    else if (m.role === 'system') lines.push(content)
    else lines.push(`User: ${content}`)
  }
  const prompt = lines.join('\n')
  return prompt.length > AI_MAX_PROMPT_CHARS ? prompt.slice(-AI_MAX_PROMPT_CHARS) : prompt
}

// Bersihkan messages untuk API bergaya OpenAI: peran hanya
// system/user/assistant, konten kosong dibuang.
export function sanitizeMessages(messages) {
  const out = []
  for (const m of messages ?? []) {
    const content = String(m?.content ?? '').trim()
    if (!content) continue
    const role = m.role === 'assistant' || m.role === 'system' ? m.role : 'user'
    out.push({ role, content })
  }
  return out
}

// POST JSON sederhana dengan validasi URL yang sama seperti
// downloadBuffer. Mengembalikan objek hasil parse JSON.
export async function postJson(rawUrl, body, { timeout = 45000, fetchImpl = fetch } = {}) {
  const url = (await assertSafeUrlResolved(rawUrl)).href
  const res = await fetchImpl(url, {
    method: 'POST',
    signal: AbortSignal.timeout(timeout),
    headers: {
      'User-Agent': randomUserAgent(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST gagal: HTTP ${res.status}`)
  return res.json()
}

export function createRudderProvider() {
  return {
    name: 'rudder',
    async chat(messages) {
      const prompt = messagesToPrompt(messages)
      if (!prompt) throw new Error('Prompt kosong')
      const result = await rudderChat(prompt)
      if (!result?.status) {
        const err = new Error(result?.error || 'rudder gagal menjawab')
        err.code = result?.error === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'UPSTREAM'
        throw err
      }
      const reply = String(result.reply || '').trim()
      if (!reply) throw new Error('Jawaban AI kosong')
      return reply.slice(0, AI_MAX_REPLY_CHARS)
    },
  }
}

// Jalur klasik: GET prompt sebagai path. Breaker 'pollinations-text'
// dipertahankan supaya riwayat keadaan breaker tidak berubah.
export function createPollinationsProvider() {
  return {
    name: 'pollinations',
    async chat(messages) {
      const prompt = messagesToPrompt(messages)
      if (!prompt) throw new Error('Prompt kosong')
      const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`
      const { buffer } = await withBreaker('pollinations-text', () =>
        downloadBuffer(url, { maxBytes: 1024 * 1024, timeout: 30000 })
      )
      const reply = buffer.toString('utf8').trim()
      if (!reply) throw new Error('Jawaban AI kosong')
      return reply.slice(0, AI_MAX_REPLY_CHARS)
    },
  }
}

// Jalur modern: POST format OpenAI ke text.pollinations.ai/openai.
// Messages dikirim apa adanya (peran terjaga), bukan prompt pipih.
// fetchImpl bisa disuntik untuk pengujian tanpa jaringan.
export function createPollinationsOpenAiProvider({ fetchImpl } = {}) {
  return {
    name: 'pollinations-openai',
    async chat(messages) {
      const clean = sanitizeMessages(messages)
      if (!clean.length) throw new Error('Prompt kosong')
      const data = await withBreaker('pollinations-openai', () =>
        postJson(
          'https://text.pollinations.ai/openai',
          { model: 'openai', messages: clean },
          { timeout: 45000, ...(fetchImpl ? { fetchImpl } : {}) }
        )
      )
      const reply = String(data?.choices?.[0]?.message?.content ?? '').trim()
      if (!reply) throw new Error('Jawaban AI kosong')
      return reply.slice(0, AI_MAX_REPLY_CHARS)
    },
  }
}

// Rantai fallback: coba sumber satu per satu sesuai urutan. Balasan
// kosong dianggap kegagalan sumber itu. Error gabungan hanya dilempar
// bila semua sumber gagal, isinya menyebut tiap sumber dan sebabnya
// supaya pesan ke pengguna tetap jujur dan bisa didiagnosis.
export function createFallbackProvider(sources, { name = 'fallback' } = {}) {
  const list = (sources ?? []).filter((s) => s && typeof s.chat === 'function')
  return {
    name,
    sources: list,
    async chat(messages) {
      if (!list.length) throw new Error('Tidak ada sumber AI yang tersedia')
      if (!messagesToPrompt(messages)) throw new Error('Prompt kosong')
      const failures = []
      for (const source of list) {
        try {
          const reply = String((await source.chat(messages)) || '').trim()
          if (!reply) throw new Error('Jawaban AI kosong')
          return reply.slice(0, AI_MAX_REPLY_CHARS)
        } catch (err) {
          failures.push(`${source.name || 'tanpa-nama'}: ${err?.message || err}`)
        }
      }
      const err = new Error(`Semua sumber AI gagal menjawab (${failures.join('; ')})`)
      err.code = 'ALL_SOURCES_DOWN'
      err.failures = failures
      throw err
    },
  }
}

// Override khusus tes: setAiProviderForTest(fake) membuat getAiProvider
// mengembalikan fake itu (boleh null untuk jalur belum terkonfigurasi),
// resetAiProviderForTest() mengembalikan perilaku normal. Produksi
// tidak pernah memanggil dua fungsi ini.
let testOverride
export function setAiProviderForTest(provider) {
  testOverride = provider
}
export function resetAiProviderForTest() {
  testOverride = undefined
}

export function getAiProvider() {
  if (testOverride !== undefined) return testOverride
  if (isRudderConfigured()) return createRudderProvider()
  return createFallbackProvider(
    [createPollinationsOpenAiProvider(), createPollinationsProvider()],
    { name: 'pollinations' }
  )
}
