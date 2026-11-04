import './load-env.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadPlugins } from '../src/core/plugin-loader.js'
import { createPipeline } from '../src/core/pipeline.js'
import { startConnection } from '../src/core/connection.js'
import { startScheduler } from '../src/core/scheduler.js'
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
// Referensi socket berjalan (diperbarui connection tiap reconnect) untuk scheduler.
const session = { sock: null }
startScheduler({ session, storage, defaultLang })

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
    const text = `${botName} online~ ${say(defaultLang, 'salam')}\nPlugin aktif: ${registry.list().length}, storage: ${storage.driver}, Node ${process.version}`
    await sock.sendMessage(`${ownerNumber}@s.whatsapp.net`, { text })
  },
})
