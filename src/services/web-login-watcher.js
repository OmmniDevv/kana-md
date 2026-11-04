// Watcher permintaan kode login dari web dashboard.
// Kontrak lengkap ada di docs/WEB.md. Ringkasnya:
// - Web menulis namespace 'web_login_requests', key = digit nomor member,
//   value { codeHash, codePlain, expiresAt, status: 'pending', attempts }.
// - Watcher ini memindai record 'pending', mengirim codePlain lewat WhatsApp,
//   lalu mengubah status menjadi 'sent' dan MENGHAPUS codePlain dari record.
//   Sesudah terkirim, kode mentah tidak lagi disimpan di mana pun di sisi bot.
// - Kode mentah TIDAK PERNAH ditulis ke log, termasuk saat gagal kirim.
// - Batas anti-spam per nomor disimpan di namespace 'web_login_limits',
//   key = digit, value { lastSentAt, day: 'YYYY-MM-DD' (WIB), count }:
//   jeda minimal 2 menit antar kirim dan maksimal 5 kode per hari.
// - Record kedaluwarsa DIHAPUS (bukan ditandai 'expired', karena kontrak
//   status web hanya mengenal pending, sent, dan used). Web membaca
//   ketiadaan record sebagai tanda user harus meminta kode baru. Alasan
//   keputusan ini juga ditulis di docs/WEB.md.
// - File ini TIDAK mewiring dirinya sendiri ke proses utama; koordinator
//   yang memanggil startWebLoginWatcher saat boot, meniru pola scheduler.
import { logger } from './logger.js'
import { wibDateString } from './user-service.js'

export const REQUESTS_NS = 'web_login_requests'
export const LIMITS_NS = 'web_login_limits'
export const MIN_INTERVAL_MS = 2 * 60 * 1000
export const MAX_PER_DAY = 5
export const DEFAULT_INTERVAL_MS = 20000

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '')

// Nomor valid: digit saja, panjang 9 sampai 15 (format internasional
// tanpa tanda plus, sama seperti key member di namespace lain).
export function isValidDigits(value) {
  return /^\d{9,15}$/.test(String(value ?? ''))
}

function resolveNow(now) {
  const value = typeof now === 'function' ? now() : now
  if (value instanceof Date) return value.getTime()
  const n = Number(value)
  return Number.isFinite(n) && value !== undefined && value !== null ? n : Date.now()
}

// Pesan WhatsApp berisi kode untuk jalur web. Bahasa mengikuti preferensi
// user bila ada ('id' atau 'en'), selain itu default 'id' karena nomor
// pendaftar web belum tentu pernah mengatur bahasa di bot.
// Fungsi ini murni (tanpa storage dan tanpa socket) supaya gampang dites.
export function formatCodeMessage(code, lang = 'id') {
  const safeCode = String(code ?? '')
  if (lang === 'en') {
    return [
      'Haii~ KANA here with your dashboard login code! (≧▽≦) ✨',
      '',
      `Your code: ${safeCode}`,
      '',
      'Type it on the login page within 10 minutes, okay~',
      'Keep this code just for you, do not share it with anyone! (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕',
    ].join('\n')
  }
  return [
    'Haii~ KANA bawain kode login dashboard kamu nih! (≧▽≦) ✨',
    '',
    `Kode kamu: ${safeCode}`,
    '',
    'Ketik kodenya di halaman login dalam 10 menit yaa~',
    'Kode ini rahasia buat kamu aja, jangan dibagi ke siapa pun! (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕',
  ].join('\n')
}

// Keadaan batas efektif untuk satu nomor pada satu waktu.
// Hari dihitung menurut WIB; ganti hari berarti count mulai dari nol lagi,
// sedangkan lastSentAt tetap dihormati untuk jeda 2 menit lintas tengah malam.
export function effectiveLimits(record, nowMs) {
  const today = wibDateString(new Date(nowMs))
  const lastSentAt = Number(record?.lastSentAt) || 0
  const count = record && record.day === today ? Number(record.count) || 0 : 0
  return { today, lastSentAt, count }
}

// Satu putaran polling. Diekspor terpisah supaya bisa dites tanpa timer.
// Mengembalikan ringkasan { sent, skipped, expired, failed }.
export async function processWebLoginRequests({ session, storage, now } = {}) {
  const summary = { sent: 0, skipped: 0, expired: 0, failed: 0 }
  if (!storage) return summary
  const nowMs = resolveNow(now)
  let keys = []
  try {
    keys = await storage.keys(REQUESTS_NS)
  } catch (err) {
    logger.warn({ err: err.message }, 'web-login watcher: gagal membaca daftar request')
    return summary
  }
  const sock = session?.sock
  for (const rawKey of keys) {
    const digits = String(rawKey ?? '')
    // Key bukan nomor valid dilewati tanpa diubah dan tanpa dikirim.
    if (!isValidDigits(digits)) {
      summary.skipped += 1
      continue
    }
    try {
      const record = await storage.get(REQUESTS_NS, digits)
      if (!record || record.status !== 'pending') {
        summary.skipped += 1
        continue
      }
      // Kedaluwarsa (atau expiresAt rusak): hapus record. Lihat komentar
      // di kepala file soal kenapa tidak ada status 'expired'.
      if (!Number.isFinite(Number(record.expiresAt)) || nowMs >= Number(record.expiresAt)) {
        await storage.delete(REQUESTS_NS, digits)
        summary.expired += 1
        continue
      }
      // Tanpa codePlain tidak ada yang bisa dikirim; lewati tanpa mengubah.
      if (!record.codePlain) {
        summary.skipped += 1
        continue
      }
      // Batas anti-spam: jeda 2 menit dan kuota 5 per hari (WIB).
      const limitsRecord = await storage.get(LIMITS_NS, digits)
      const limits = effectiveLimits(limitsRecord, nowMs)
      if (limits.lastSentAt && nowMs - limits.lastSentAt < MIN_INTERVAL_MS) {
        summary.skipped += 1
        continue
      }
      if (limits.count >= MAX_PER_DAY) {
        summary.skipped += 1
        continue
      }
      if (typeof sock?.sendMessage !== 'function') {
        summary.skipped += 1
        continue
      }
      const lang = (await storage.get('users', `${digits}:lang`)) || 'id'
      try {
        await sock.sendMessage(`${digits}@s.whatsapp.net`, {
          text: formatCodeMessage(record.codePlain, lang === 'en' ? 'en' : 'id'),
        })
      } catch (err) {
        // Gagal kirim: attempts naik, status tetap 'pending' dan codePlain
        // dipertahankan supaya putaran berikut bisa mencoba lagi. Jeda
        // antar percobaan diatur interval watcher (default 20 detik),
        // jadi tidak ada loop ketat. Kode tidak ikut dicatat di log.
        await storage.set(REQUESTS_NS, digits, {
          ...record,
          attempts: (Number(record.attempts) || 0) + 1,
        })
        logger.warn({ err: err.message, digits }, 'web-login watcher: kirim kode gagal, dicoba lagi nanti')
        summary.failed += 1
        continue
      }
      // Sukses: bangun record BARU tanpa codePlain (field dihapus total,
      // bukan diisi string kosong), status menjadi 'sent'.
      const { codePlain: _dropped, ...rest } = record
      await storage.set(REQUESTS_NS, digits, {
        ...rest,
        status: 'sent',
        attempts: (Number(record.attempts) || 0) + 1,
      })
      await storage.set(LIMITS_NS, digits, {
        lastSentAt: nowMs,
        day: limits.today,
        count: limits.count + 1,
      })
      summary.sent += 1
    } catch (err) {
      // Satu record bermasalah tidak boleh menghentikan record lain.
      logger.warn({ err: err.message, digits }, 'web-login watcher: record gagal diproses')
      summary.failed += 1
    }
  }
  return summary
}

// Jalankan watcher berkala, meniru pola scheduler: timer unref (tidak
// menahan proses), tick pertama setelah 5 detik, tiap tick dibungkus
// try/catch. Mengembalikan { stop, tick }.
export function startWebLoginWatcher({ session, storage, intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  let stopped = false

  async function tick(now) {
    if (stopped) return undefined
    try {
      return await processWebLoginRequests({ session, storage, now })
    } catch (err) {
      logger.warn({ err: err.message }, 'web-login watcher tick gagal')
      return undefined
    }
  }

  const timer = setInterval(() => {
    tick().catch(() => {})
  }, intervalMs)
  timer.unref?.()
  const first = setTimeout(() => {
    tick().catch(() => {})
  }, 5000)
  first.unref?.()

  return {
    stop() {
      stopped = true
      clearInterval(timer)
      clearTimeout(first)
    },
    tick,
  }
}

// Helper kecil untuk pemanggil yang hanya punya JID mentah.
export function digitsFromJid(jid) {
  return onlyDigits(String(jid ?? '').split('@')[0])
}
