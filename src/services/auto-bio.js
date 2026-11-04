// Auto bio: tiap bot connect, bio profil WhatsApp bot diisi status ON plus
// runtime, diperbarui berkala, dan diubah ke OFF saat shutdown rapi.
// API: sock.updateProfileStatus(status) sesuai README library v1.4.7
// (IQ status klasik, terkonfirmasi ada di src/Socket/chats.js paket 1.4.7).
// Semua kegagalan bio ditangkap dan hanya dicatat: bio tidak boleh menjatuhkan bot.
//
// Template bisa dikustomisasi lewat .env:
//   BIO_ON_TEMPLATE, BIO_OFF_TEMPLATE
// Placeholder: {bot} nama bot, {runtime} runtime terformat, {since} jam
// mulai format HH:mm WIB. Bila env kosong, dipakai default moe di bawah.
import { logger } from './logger.js'

export const DEFAULT_ON_TEMPLATE = '{bot} lagi ON nih~ runtime {runtime} (◕ᴗ◕✿)'
export const DEFAULT_OFF_TEMPLATE = '{bot} lagi OFF dulu yaa, sampai jumpa~'
export const DEFAULT_INTERVAL_MS = 5 * 60 * 1000

const pad = (n) => String(n).padStart(2, '0')

// Format runtime ringkas: 0m, 5m, 1j 05m, 2 hari 3j 04m.
export function formatRuntime(ms) {
  const totalMinutes = Math.max(0, Math.floor(Number(ms || 0) / 60000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days} hari ${hours}j ${pad(minutes)}m`
  if (hours > 0) return `${hours}j ${pad(minutes)}m`
  return `${minutes}m`
}

export function formatSince(date) {
  // Rakit manual dengan titik dua: format bawaan id-ID di sebagian build ICU
  // memakai pemisah titik (13.48), padahal kontrak placeholder adalah HH:mm.
  const parts = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).formatToParts(date)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return `${pad(hour)}:${pad(minute)}`
}

export function renderBioTemplate(template, { bot, runtime, since }) {
  return String(template)
    .replaceAll('{bot}', bot)
    .replaceAll('{runtime}', runtime)
    .replaceAll('{since}', since)
}

async function setProfileStatus(sock, text) {
  if (typeof sock?.updateProfileStatus !== 'function') return false
  await sock.updateProfileStatus(text)
  return true
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(false), ms)),
  ])
}

// Mulai auto bio untuk satu socket. Mengembalikan controller { stop, setOff }.
export function startAutoBio(sock, { botName = 'KANA', intervalMs = DEFAULT_INTERVAL_MS, env = process.env } = {}) {
  const startedAt = new Date()
  const onTemplate = env.BIO_ON_TEMPLATE?.trim() || DEFAULT_ON_TEMPLATE
  const offTemplate = env.BIO_OFF_TEMPLATE?.trim() || DEFAULT_OFF_TEMPLATE
  let timer = null
  let stopped = false

  const render = (template) =>
    renderBioTemplate(template, {
      bot: botName,
      runtime: formatRuntime(Date.now() - startedAt.getTime()),
      since: formatSince(startedAt),
    })

  async function applyOn() {
    if (stopped) return
    try {
      await setProfileStatus(sock, render(onTemplate))
    } catch (err) {
      logger.warn({ err: err.message }, 'auto bio ON gagal, diabaikan')
    }
  }

  applyOn()
  timer = setInterval(applyOn, intervalMs)
  timer.unref?.()

  return {
    startedAt,
    stop() {
      stopped = true
      if (timer) clearInterval(timer)
      timer = null
    },
    async setOff() {
      this.stop()
      try {
        await withTimeout(setProfileStatus(sock, render(offTemplate)), 3000)
      } catch (err) {
        logger.warn({ err: err.message }, 'auto bio OFF gagal, diabaikan')
      }
    },
  }
}
