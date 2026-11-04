import makeWASocket, { DisconnectReason } from '@rexxhayanasi/elaina-baileys'
import pino from 'pino'
import { logger } from '../services/logger.js'
import { startAutoBio } from '../services/auto-bio.js'

// Koneksi mengikuti README library v1.4.7:
// - pairing code hanya bila state.creds.registered belum true
// - 409 pairing: cancelPairingCode() lalu minta ulang sekali
// - rate-overlimit: berhenti, jangan loop
// - reconnect: exponential backoff + jitter; loggedOut: clearAuth() dan berhenti
export async function startConnection({ auth, botNumber, ownerNumber, botName = 'KANA', onMessage, onOpen, autoBio = false }) {
  const { state, saveCreds, clearAuth } = auth
  let attempt = 0
  let stopped = false
  let sock = null
  let pairingRequested = false
  let bio = null

  async function connect() {
    if (stopped) return
    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      pairingCodeTimeoutMs: 180000,
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return
      for (const m of messages) {
        try {
          await onMessage(sock, m)
        } catch (err) {
          logger.error({ err: err.message }, 'pipeline error')
        }
      }
    })
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'connecting' && !state.creds.registered && !pairingRequested && botNumber) {
        pairingRequested = true
        // Jeda 6 detik supaya socket benar-benar siap sebelum meminta kode.
        // Jeda 3 detik terbukti gagal live 2026-11-04 (error Connection
        // Closed, sisa sesinya membuat run berikutnya kena loggedOut);
        // 6 detik terbukti berhasil dengan kode kustom KANAMOE1.
        setTimeout(async () => {
          try {
            const code = await sock.requestPairingCode(botNumber, 'KANAMOE1')
            logger.info(`Kode pairing KANA: ${code}`)
            logger.info('WhatsApp > Perangkat tertaut > Tautkan perangkat > Tautkan dengan nomor telepon saja')
          } catch (err) {
            if (err?.output?.statusCode === 409 || err?.data === 409) {
              try {
                await sock.cancelPairingCode()
                const code = await sock.requestPairingCode(botNumber, 'KANAMOE1')
                logger.info(`Kode pairing KANA (percobaan ulang): ${code}`)
              } catch (err2) {
                logger.error({ err: err2.message }, 'pairing gagal setelah 409')
              }
            } else {
              logger.error({ err: err.message, data: err.data }, 'pairing gagal, berhenti tanpa loop')
            }
          }
        }, 6000)
      }
      if (connection === 'open') {
        attempt = 0
        logger.info('KANA tersambung ke WhatsApp')
        if (autoBio) {
          bio?.stop()
          bio = startAutoBio(sock, { botName })
        }
        if (ownerNumber && onOpen) {
          try {
            await onOpen(sock)
          } catch (err) {
            logger.error({ err: err.message }, 'notif owner gagal')
          }
        }
      }
      if (connection === 'close') {
        bio?.stop()
        const statusCode = lastDisconnect?.error?.output?.statusCode
        if (statusCode === DisconnectReason.loggedOut) {
          stopped = true
          logger.error('Sesi loggedOut. Sesi dibersihkan, pairing ulang diperlukan.')
          if (clearAuth) await clearAuth()
          return
        }
        if (stopped) return
        attempt += 1
        const backoff = Math.min(30000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 1000)
        logger.warn({ attempt, backoff }, 'koneksi putus, reconnect')
        setTimeout(connect, backoff)
      }
    })
    return sock
  }

  const shutdown = async () => {
    stopped = true
    // Best-effort: bio OFF dulu (timeout pendek di dalam setOff), baru tutup socket.
    if (bio) {
      try {
        await bio.setOff()
      } catch {}
      bio = null
    }
    try {
      sock?.end?.(undefined)
    } catch {}
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)

  return connect()
}
