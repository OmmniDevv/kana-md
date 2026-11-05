// Manajer sesi jadibot (Fase 10).
//
// PERINGATAN KEAMANAN: sesi jadibot adalah bot PENUH yang berjalan di
// nomor WhatsApp lain memakai pipeline yang sama dengan bot utama.
// Sejak keputusan owner 2026-11-05, gerbangnya adalah PREMIUM personal
// atau sewa jadibot (bukan lagi isOwner): lihat gate di pipeline dan
// src/services/premium.js. Jumlah sesi tetap dibatasi keras
// (MAX_SESSIONS), dan plugin mencatat pemegang sesi supaya pengguna
// premium hanya bisa menghentikan sesinya sendiri.
//
// Cara kerja (mengikuti bentuk nyata di repo, bukan karangan):
// - src/core/connection.js mengekspor startConnection({ auth, botNumber,
//   ownerNumber, botName, onMessage, onParticipants, session, autoBio })
//   dan mengembalikan sock hasil connect(). Ia tidak mengembalikan
//   handle { stop() }, jadi stop di sini memanggil sock.end() bila ada.
// - Auth state berasal dari storage lewat src/storage/index.js
//   (createAuthState). Sesi jadibot memakai auth TERPISAH per nama:
//   driver local: useMultiFileAuthState di <LOCAL_DATA_DIR>/jadibot/<nama>
//   driver supabase: usePostgresAuthState dengan session 'jadibot-<nama>'.
// - Pipeline sesi dibuat dengan createPipeline yang sama seperti bot
//   utama: registry, storage, owners, dan defaultLang yang sama.
// - Pairing: connection.js meminta kode pairing dengan kode kustom yang
//   hardcoded di sana. Untuk sesi jadibot, kode yang didokumentasikan
//   dan diberitahukan ke owner dihitung oleh pairingCodeFor(): 8 char
//   pertama dari nama sesi di-uppercase ditambah padding 'KANA'. Kode
//   yang benar-benar diminta ke WhatsApp tetap mengikuti alur
//   connection.js; owner memasukkan kode yang tampil di log/chat.
import { usePostgresAuthState } from '@rexxhayanasi/elaina-baileys'
import { createLocalAuthState, guardAuthState } from '../storage/index.js'
import { createPipeline } from '../core/pipeline.js'
import { startConnection as realStartConnection } from '../core/connection.js'
import { logger } from './logger.js'

export const MAX_SESSIONS = 3

const digitsOnly = (s) => String(s ?? '').replace(/\D/g, '')

export function validateJadibotName(name) {
  const n = String(name ?? '').trim()
  return /^[a-zA-Z0-9_-]{3,16}$/.test(n) ? n : null
}

export function pairingCodeFor(name) {
  const base = String(name ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return (base + 'KANAKANA').slice(0, 8)
}

// Auth terpisah per sesi, mengikuti driver storage aktif. Keduanya lewat
// guardAuthState (lewat createLocalAuthState untuk lokal) supaya jalur
// loggedOut di connection.js beneran menghapus sesi jadibot juga;
// useMultiFileAuthState bawaan library tidak menyediakan clearAuth.
export async function createSessionAuth(storage, name, env = process.env) {
  if (storage?.driver === 'supabase') {
    const auth = await usePostgresAuthState({ pool: storage.pool, session: `jadibot-${name}` })
    return guardAuthState(auth)
  }
  const base = env.LOCAL_DATA_DIR || '.dev-data'
  return createLocalAuthState(`${base}/jadibot/${name}`)
}

function stopFromResult(result, sessionRef) {
  return async () => {
    try {
      if (typeof result?.stop === 'function') return await result.stop()
    } catch {}
    try {
      sessionRef?.sock?.end?.(undefined)
    } catch {}
    try {
      if (result && typeof result.end === 'function') result.end(undefined)
    } catch {}
  }
}

export function createJadibotManager({
  storage,
  registry,
  owners = [],
  defaultLang = 'id',
  startConnectionFn = null,
  notify = null,
  env = process.env,
} = {}) {
  if (!storage) throw new Error('jadibot manager butuh storage')
  if (!registry) throw new Error('jadibot manager butuh registry')
  const sessions = new Map()
  const ownerDigits = owners.map(digitsOnly).filter(Boolean)

  async function start(name, number, notifyChat = null) {
    const validName = validateJadibotName(name)
    if (!validName) {
      const err = new Error('Nama sesi tidak valid (alfanumerik 3-16 karakter)')
      err.code = 'INVALID_NAME'
      throw err
    }
    const num = digitsOnly(number)
    if (num.length < 9 || num.length > 15) {
      const err = new Error('Nomor sesi tidak valid')
      err.code = 'INVALID_NUMBER'
      throw err
    }
    const key = validName.toLowerCase()
    if (sessions.has(key)) {
      const err = new Error(`Sesi ${validName} sudah aktif`)
      err.code = 'DUPLICATE'
      throw err
    }
    if (sessions.size >= MAX_SESSIONS) {
      const err = new Error(`Batas ${MAX_SESSIONS} sesi jadibot tercapai`)
      err.code = 'MAX_SESSIONS'
      throw err
    }

    const pipeline = createPipeline({ registry, storage, owners: ownerDigits, defaultLang })
    const onMessage = (sock, m) => pipeline.handle(sock, m)
    const onParticipants = (sock, ev) => pipeline.handleParticipants(sock, ev)
    const pairingCode = pairingCodeFor(validName)

    let handle
    if (typeof startConnectionFn === 'function') {
      // Jalur injeksi (tes dan plugin owner yang membungkus connection
      // asli lewat impor dinamis). Auth dibuat pemanggil bila perlu.
      const result = await startConnectionFn({
        name: validName,
        number: num,
        onMessage,
        onParticipants,
        notifyChat,
        storage,
        registry,
        owners: ownerDigits,
        defaultLang,
      })
      handle = { stop: stopFromResult(result, result?.session ?? null), raw: result }
    } else {
      const auth = await createSessionAuth(storage, validName, env)
      const sessionRef = { sock: null }
      const sock = await realStartConnection({
        auth,
        botNumber: num,
        ownerNumber: ownerDigits[0] || '',
        botName: env.BOT_NAME || 'KANA',
        onMessage,
        onParticipants,
        session: sessionRef,
        autoBio: false,
      })
      handle = { stop: stopFromResult(sock, sessionRef), raw: sock }
    }

    const record = { name: validName, number: num, startedAt: new Date().toISOString(), pairingCode }
    sessions.set(key, { ...record, handle })

    // Beritahu owner lewat callback notify (bila ada) atau sock utama
    // pada notifyChat { sock, chat }.
    const notice = `Sesi jadibot ${validName} (${num}) dimulai. Kode pairing sesi: ${pairingCode}. Masukkan kode yang tampil saat sesi meminta pairing di WhatsApp nomor itu.`
    try {
      if (typeof notify === 'function') await notify({ ...record, text: notice })
      else if (notifyChat?.sock && notifyChat?.chat) {
        await notifyChat.sock.sendMessage(notifyChat.chat, { text: notice })
      }
    } catch (err) {
      logger.warn({ err: err.message, session: validName }, 'notif jadibot gagal')
    }
    return record
  }

  async function stop(name) {
    const key = String(name ?? '').trim().toLowerCase()
    const session = sessions.get(key)
    if (!session) return false
    sessions.delete(key)
    try {
      await session.handle?.stop?.()
    } catch (err) {
      logger.warn({ err: err.message, session: key }, 'stop jadibot gagal sebagian')
    }
    return true
  }

  function list() {
    return [...sessions.values()].map(({ name, number, startedAt }) => ({ name, number, startedAt }))
  }

  return { start, stop, list, get size() { return sessions.size } }
}

// Singleton modul: dipakai plugin owner untuk membuat manager sekali,
// dan dibaca plugins/main/listbot.js lewat listJadibotSessions()
// dengan kontrak [{ name, number, startedAt }].
let activeManager = null
export function setJadibotManager(manager) {
  activeManager = manager ?? null
  return activeManager
}
export function getJadibotManager() {
  return activeManager
}
export function listJadibotSessions() {
  return activeManager ? activeManager.list() : []
}
