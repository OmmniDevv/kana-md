// Provider AI terpadu untuk plugin AI.
// Urutan pilihan:
// 1. rudder.chat, hanya bila owner sudah mengisi env rudder (opt-in).
//    Lihat src/scrapers/ai/rudder.js: ekspornya rudderChat(pesan) dan
//    isRudderConfigured(). rudderChat hanya menerima satu string, jadi
//    riwayat pesan dirangkai dulu jadi satu prompt teks.
// 2. Pollinations teks publik tanpa key (https://text.pollinations.ai),
//    gratis dan sudah dipakai proyek ini untuk gambar. Ini fallback
//    bawaan, jadi .ai tetap jalan walau rudder belum dikonfigurasi.
// Provider selalu punya field name: 'rudder' atau 'pollinations'.
// Bila jaringan gagal, chat() melempar error dan handler yang membalas
// jujur ke pengguna. Tidak ada provider lain yang dikarang di sini.
import { rudderChat, isRudderConfigured } from '../scrapers/ai/rudder.js'
import { downloadBuffer, withBreaker } from '../scrapers/runner.js'

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
  return createPollinationsProvider()
}
