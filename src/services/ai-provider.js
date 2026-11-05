// Provider AI terpadu untuk plugin AI.
// Urutan pilihan:
// 1. rudder.chat, hanya bila owner sudah mengisi env rudder (opt-in).
//    Lihat src/scrapers/ai/rudder.js: ekspornya rudderChat(pesan) dan
//    isRudderConfigured(). rudderChat hanya menerima satu string, jadi
//    riwayat pesan dirangkai dulu jadi satu prompt teks.
// 2. Rantai fallback Pollinations teks publik tanpa key. Dua jalur
//    endpoint yang berbeda pada layanan yang sama, masing-masing dengan
//    circuit breaker khusus AI di file ini (lihat bagian perlindungan
//    Pollinations di bawah):
//    a. POST https://text.pollinations.ai/openai (format OpenAI,
//       model 'openai'). Jalur modern yang direkomendasikan vendor dan
//       terverifikasi menjawab dari VM ini pada 2026-11-05.
//    b. GET https://text.pollinations.ai/<prompt> (jalur klasik).
//    Insiden 2026-11-05 pagi: jalur GET klasik timeout total dari VM
//    ini sampai breakernya terbuka dan SEMUA plugin AI mati bersama
//    karena hanya ada satu sumber. Sekarang kegagalan satu jalur
//    otomatis lanjut ke jalur berikutnya; pesan error "semua sumber
//    gagal" hanya muncul bila seluruh rantai gagal.
//    Insiden 2026-11-05 sore: di bawah beban burst, Pollinations
//    membalas HTTP 402 (batas laju tier anonim untuk IP bersama).
//    Breaker generik lama menghitung 402 itu seperti sumber mati:
//    3 kegagalan beruntun membuka breaker selama 5 menit tanpa
//    percobaan half-open, jadi semua perintah AI teks terkunci
//    massal padahal sumbernya hidup untuk panggilan santai.
//    Perlindungan baru di file ini: panggilan diserialkan lewat satu
//    antrean, 402/429 ditunggu dengan backoff lalu dicoba ulang di
//    dalam panggilan yang sama, dan breaker khusus AI hanya membuka
//    sesudah 5 kegagalan beruntun dengan cooldown 30 detik plus satu
//    percobaan half-open, jadi sumber pulih sendiri dalam puluhan
//    detik tanpa restart proses.
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
import { assertSafeUrlResolved, downloadBuffer, randomUserAgent, sleep } from '../scrapers/runner.js'

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
  if (!res.ok) {
    const err = new Error(`POST gagal: HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

// --- Perlindungan sumber Pollinations ---
// Tier anonim Pollinations membatasi laju per IP bersama dan membalas
// kelebihannya dengan HTTP 402 (kadang 429). Itu kegagalan nyata untuk
// panggilan yang sedang berjalan (fallback tetap lanjut ke sumber
// berikutnya), tapi sifatnya sesaat: panggilan santai sesudahnya bisa
// langsung berhasil. Tiga lapis perlindungan di sini menjaga supaya
// kegagalan sesaat itu tidak berubah jadi kunci massal:
// 1. Gerbang serial: panggilan upstream dari proses ini antre satu
//    per satu, jadi plugin dan pengguna yang menembak bersamaan tidak
//    saling menabrak kuota sendiri.
// 2. Retry batas laju: jawaban 402/429 ditunggu dengan backoff
//    (2, 4, 8 detik) lalu dicoba ulang di dalam panggilan yang sama
//    sebelum dinyatakan gagal.
// 3. Circuit breaker khusus AI per jalur: membuka hanya sesudah 5
//    kegagalan beruntun yang sudah lolos retry, cooldown 30 detik,
//    lalu tepat satu percobaan half-open. Sukses menutup dan
//    mereset hitungan; gagal membuka lagi 30 detik. Kegagalan satu
//    jalur tidak pernah menyentuh keadaan jalur lain.
// Breaker generik di src/scrapers/runner.js sengaja tidak dipakai
// lagi untuk AI: ambangnya 3 dengan cooldown 5 menit tanpa half-open
// terbukti mengunci semua perintah AI teks pada insiden 2026-11-05.
export const AI_BREAKER_THRESHOLD = 5
export const AI_BREAKER_COOLDOWN_MS = 30_000
export const AI_RATE_LIMIT_RETRIES = 3
export const AI_RATE_LIMIT_BASE_DELAY_MS = 2_000

// Status HTTP dari error upstream: dari field status bila ada
// (postJson menempelkannya), selain itu dari pesan "HTTP <kode>"
// seperti yang dihasilkan downloadBuffer di runner.
export function httpStatusOf(err) {
  if (Number.isFinite(err?.status)) return err.status
  const match = /HTTP (\d{3})/.exec(String(err?.message || ''))
  return match ? Number(match[1]) : 0
}

export function isRateLimitError(err) {
  const status = httpStatusOf(err)
  return status === 402 || status === 429
}

function sourceDownError(key) {
  const err = new Error(`Sumber ${key} sedang tidak tersedia (circuit breaker terbuka)`)
  err.code = 'SOURCE_DOWN'
  return err
}

// Circuit breaker dengan half-open satu percobaan. Jam bisa disuntik
// untuk pengujian. state() terekspos untuk diagnosis dan tes.
export function createAiBreaker(
  key,
  { threshold = AI_BREAKER_THRESHOLD, cooldownMs = AI_BREAKER_COOLDOWN_MS, now = Date.now } = {}
) {
  let failures = 0
  let openUntil = 0
  let trialInFlight = false
  return {
    key,
    state: () => ({ failures, openUntil, trialInFlight }),
    async call(fn) {
      if (openUntil > now()) throw sourceDownError(key)
      if (openUntil !== 0) {
        // Masa cooldown lewat: status half-open, satu percobaan saja.
        if (trialInFlight) throw sourceDownError(key)
        trialInFlight = true
        try {
          const result = await fn()
          failures = 0
          openUntil = 0
          return result
        } catch (err) {
          openUntil = now() + cooldownMs
          throw err
        } finally {
          trialInFlight = false
        }
      }
      try {
        const result = await fn()
        failures = 0
        return result
      } catch (err) {
        failures += 1
        if (failures >= threshold) openUntil = now() + cooldownMs
        throw err
      }
    },
  }
}

// Antrean serial proses-lokal untuk panggilan upstream Pollinations.
// Kedua jalur memakai gerbang yang sama karena kuota tier anonimnya
// satu untuk layanan yang sama.
let gateTail = Promise.resolve()
export function withPollinationsGate(fn) {
  const run = gateTail.then(() => fn())
  gateTail = run.catch(() => {})
  return run
}

// Jalankan fn; khusus error batas laju (402/429) tunggu backoff lalu
// coba lagi. Error lain langsung dilempar apa adanya.
export async function withRateLimitRetry(
  fn,
  { retries = AI_RATE_LIMIT_RETRIES, baseDelayMs = AI_RATE_LIMIT_BASE_DELAY_MS, sleepImpl = sleep } = {}
) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt)
    } catch (err) {
      lastError = err
      if (!isRateLimitError(err) || attempt === retries) throw err
      await sleepImpl(baseDelayMs * 2 ** attempt)
    }
  }
  throw lastError
}

const pollinationsBreakers = {
  'pollinations-openai': createAiBreaker('pollinations-openai'),
  'pollinations-text': createAiBreaker('pollinations-text'),
}

export function aiBreakerState(key) {
  return pollinationsBreakers[key]?.state() ?? { failures: 0, openUntil: 0, trialInFlight: false }
}

// Satu panggilan upstream Pollinations yang terlindungi penuh:
// breaker per jalur di luar, gerbang serial dan retry batas laju
// di dalam. fn harus sudah mengembalikan balasan terparse dan
// melempar bila isinya kosong, supaya kegagalan yang dihitung
// breaker adalah kegagalan nyata sesudah parsing benar.
export function callPollinations(key, fn) {
  const breaker = pollinationsBreakers[key]
  if (!breaker) throw new Error(`Breaker AI tidak dikenal: ${key}`)
  return breaker.call(() => withPollinationsGate(() => withRateLimitRetry(fn)))
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

// Jalur klasik: GET prompt sebagai path. Kunci breaker
// 'pollinations-text' dipertahankan dari era breaker generik.
export function createPollinationsProvider() {
  return {
    name: 'pollinations',
    async chat(messages) {
      const prompt = messagesToPrompt(messages)
      if (!prompt) throw new Error('Prompt kosong')
      const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`
      const reply = await callPollinations('pollinations-text', async () => {
        const { buffer } = await downloadBuffer(url, { maxBytes: 1024 * 1024, timeout: 30000 })
        const text = buffer.toString('utf8').trim()
        if (!text) throw new Error('Jawaban AI kosong')
        return text
      })
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
      const reply = await callPollinations('pollinations-openai', async () => {
        const data = await postJson(
          'https://text.pollinations.ai/openai',
          { model: 'openai', messages: clean },
          { timeout: 45000, ...(fetchImpl ? { fetchImpl } : {}) }
        )
        const text = String(data?.choices?.[0]?.message?.content ?? '').trim()
        if (!text) throw new Error('Jawaban AI kosong')
        return text
      })
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
