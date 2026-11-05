// Pengunggah berkas ke uguu.se (hosting berkas publik tanpa kunci).
// Dipakai plugin .upload; perilaku fitur meniru tourl/uguu/catbox di
// RYO-YAMADA-MD (audit RYO 2026-11-05) tetapi ditulis ulang gaya KANA.
// Terverifikasi dari VM 2026-11-05: unggah PNG uji membalas JSON sukses
// dengan URL https://d.uguu.se/<acak>.png yang bisa diunduh balik.
// Catatan: litterbox.catbox.moe dicoba sebagai cadangan dan TIDAK
// terjangkau dari VM (HTTP 000), jadi tidak dimasukkan rantai.
import { retry, withBreaker } from '../runner.js'

export function parseUguuResponse(json) {
  if (!json || typeof json !== 'object') return null
  if (json.success !== true) return null
  const file = Array.isArray(json.files) ? json.files[0] : null
  const url = file?.url
  if (typeof url !== 'string' || !/^https:\/\/(d\.)?uguu\.se\//.test(url)) return null
  return {
    url,
    fileName: typeof file.filename === 'string' ? file.filename : null,
    size: Number(file.size) || 0,
    hash: typeof file.hash === 'string' ? file.hash : null,
  }
}

export async function uploadToUguu(buffer, fileName = 'file.bin') {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('Buffer berkas kosong')
  return withBreaker('uguu', () =>
    retry(async () => {
      const form = new FormData()
      form.append('files[]', new Blob([buffer]), fileName || 'file.bin')
      const res = await fetch('https://uguu.se/upload.php', {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(60000),
        headers: { 'User-Agent': 'KANA-Bot' },
      })
      if (!res.ok) throw new Error(`uguu.se balas HTTP ${res.status}`)
      const parsed = parseUguuResponse(await res.json().catch(() => null))
      if (!parsed) throw new Error('uguu.se tidak mengembalikan URL berkas')
      return parsed
    })
  )
}
