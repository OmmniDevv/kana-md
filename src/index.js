import './load-env.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadPlugins } from '../src/core/plugin-loader.js'
import { createPipeline } from '../src/core/pipeline.js'
import { startConnection } from '../src/core/connection.js'
import { startScheduler } from '../src/core/scheduler.js'
import { startWebLoginWatcher } from './services/web-login-watcher.js'
import { createSupabaseRest } from './services/supabase-rest.js'
import { createBridgeStorage, isBridgeEnabled } from './services/web-bridge.js'
import { createStorage, createAuthState } from '../src/storage/index.js'
import { say } from './persona/moe.js'
import { logger } from './services/logger.js'

const here = dirname(fileURLToPath(import.meta.url))
const botName = process.env.BOT_NAME || 'KANA'
const botNumber = (process.env.BOT_NUMBER || '').replace(/\D/g, '')
const ownerNumber = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
const defaultLang = process.env.DEFAULT_LANG || 'id'

const storage = createStorage()
if (storage.init) await storage.init()
const registry = await loadPlugins(join(here, '../plugins'))
logger.info(
  { plugins: registry.list().map((p) => p.config.name), quarantined: registry.quarantined.length },
  'plugin dimuat'
)

if (!botNumber) {
  logger.warn(
    'BOT_NUMBER belum diisi di .env, jadi KANA belum pairing. Isi BOT_NUMBER dan OWNER_NUMBER lalu jalankan lagi. Base selesai di sini (Gate 1).'
  )
  process.exit(0)
}

const pipeline = createPipeline({ registry, storage, owners: [ownerNumber], defaultLang })
const auth = await createAuthState(storage)
// Jembatan HTTPS data web: bila SUPABASE_REST_URL dan
// SUPABASE_SERVICE_ROLE_KEY terisi, watcher login web dan flush bot_stats
// scheduler memakai adapter yang merutekan namespace web ke PostgREST
// Supabase (storage utama tetap lokal). Bila env kosong, bridgeStorage
// adalah storage apa adanya dan perilaku lama tidak berubah.
let bridgeStorage = storage
if (isBridgeEnabled(process.env)) {
  bridgeStorage = createBridgeStorage(
    storage,
    createSupabaseRest({
      url: process.env.SUPABASE_REST_URL,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }),
    { healthFile: join(process.env.LOCAL_DATA_DIR || 'data', 'bridge-health.json') }
  )
  logger.info('jembatan HTTPS data web aktif untuk watcher login dan bot_stats')
}
// Referensi socket berjalan (diperbarui connection tiap reconnect) untuk scheduler.
const session = { sock: null }
startScheduler({
  session,
  storage: bridgeStorage,
  defaultLang,
  statsSource: () => ({
    startedAt: pipeline.stats.startedAt,
    totalCommands: pipeline.stats.totalCommands,
    pluginCount: registry.list().length,
  }),
})
// Watcher login web: mengirim kode verifikasi untuk record pending di
// namespace web_login_requests (kontrak docs/WEB.md). Berjalan bersama
// scheduler memakai session socket yang sama.
startWebLoginWatcher({ session, storage: bridgeStorage })

await startConnection({
  auth,
  botNumber,
  ownerNumber,
  botName,
  session,
  autoBio: (process.env.AUTO_BIO ?? 'true').toLowerCase() !== 'false',
  onMessage: pipeline.handle,
  onParticipants: pipeline.handleParticipants,
  onOpen: async (sock) => {
    if (!ownerNumber) return
    // Sapaan online dibatasi maksimal sekali per 6 jam, dicatat persisten
    // di storage: koneksi yang putus sambung beruntun (reconnect) tidak
    // boleh berubah menjadi spam sapaan ke owner.
    const lastNotify = Number((await storage.get('bot_meta', 'last_online_notify_at').catch(() => 0)) || 0)
    if (Date.now() - lastNotify < 6 * 60 * 60 * 1000) return
    await storage.set('bot_meta', 'last_online_notify_at', Date.now()).catch(() => {})
    const text = `${botName} online~ ${say(defaultLang, 'salam')}\nPlugin aktif: ${registry.list().length}, storage: ${storage.driver}, Node ${process.version}`
    await sock.sendMessage(`${ownerNumber}@s.whatsapp.net`, { text })
  },
})
