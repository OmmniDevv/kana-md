import { readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Pembersih otomatis folder temp milik bot sendiri.
//
// Semua jalur unduh dan konversi di repo ini membuat folder kerja dengan
// mkdtemp(join(tmpdir(), 'kana-...')) dan biasanya menghapusnya sendiri
// lewat rm di akhir. Folder yang tertinggal karena proses mati di tengah
// jalan menumpuk pelan pelan, jadi sapuan ini membuang entri berawalan
// kana- di tmpdir sistem yang umurnya melewati ambang. Entri yang masih
// segar tidak disentuh karena bisa jadi sedang dipakai proses yang hidup.

export const TMP_PREFIX = 'kana-'

async function dirSize(path) {
  let total = 0
  try {
    const entries = await readdir(path, { withFileTypes: true })
    for (const e of entries) {
      const full = join(path, e.name)
      if (e.isDirectory()) total += await dirSize(full)
      else {
        try { total += (await stat(full)).size } catch {}
      }
    }
  } catch {}
  return total
}

// Buang folder/file berawalan kana- di base yang mtime-nya lebih tua dari
// maxAgeMs (0 berarti buang semuanya, sama seperti perintah .cleartmp).
export async function cleanKanaTmp({ base = tmpdir(), maxAgeMs = 0, now = Date.now() } = {}) {
  const entries = await readdir(base, { withFileTypes: true })
  let count = 0
  let bytes = 0
  for (const e of entries) {
    if (!e.name.startsWith(TMP_PREFIX)) continue
    const full = join(base, e.name)
    try {
      if (maxAgeMs > 0) {
        const st = await stat(full)
        if (now - st.mtimeMs < maxAgeMs) continue
      }
      if (e.isDirectory()) bytes += await dirSize(full)
      else {
        try { bytes += (await stat(full)).size } catch {}
      }
      await rm(full, { recursive: true, force: true })
      count += 1
    } catch {}
  }
  return { count, bytes }
}

// Jalankan sapuan berkala. Timer di-unref supaya tidak menahan proses.
// Mengembalikan fungsi stop. Kegagalan sapuan hanya dicatat, tidak pernah
// menjatuhkan bot (satu fitur rusak tidak boleh menjatuhkan bot).
export function startTmpCleaner({
  logger,
  intervalMin = 30,
  maxAgeMin = 60,
  initialDelayMs = 30_000,
} = {}) {
  const maxAgeMs = Math.max(0, Number(maxAgeMin) || 0) * 60_000
  const intervalMs = Math.max(1, Number(intervalMin) || 30) * 60_000
  let stopped = false
  const sweep = async () => {
    if (stopped) return
    try {
      const { count, bytes } = await cleanKanaTmp({ maxAgeMs })
      if (count > 0) {
        logger?.info({ count, kb: Math.round(bytes / 1024) }, 'temp kana- lama dibersihkan otomatis')
      }
    } catch (err) {
      logger?.warn({ err: err.message }, 'sapuan temp otomatis gagal, dicoba lagi nanti')
    }
  }
  const first = setTimeout(sweep, initialDelayMs)
  first.unref?.()
  const timer = setInterval(sweep, intervalMs)
  timer.unref?.()
  return () => {
    stopped = true
    clearTimeout(first)
    clearInterval(timer)
  }
}
