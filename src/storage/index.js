import { useMultiFileAuthState, usePostgresAuthState } from '@rexxhayanasi/elaina-baileys'
import { createLocalStorage } from './local.js'
import { createSupabaseStorage } from './supabase.js'

// Driver switch lewat env STORAGE_DRIVER: local (dev) atau supabase (production).
export function createStorage(env = process.env) {
  const driver = (env.STORAGE_DRIVER || 'local').toLowerCase()
  if (driver === 'supabase') return createSupabaseStorage(env.DATABASE_URL)
  return createLocalStorage(env.LOCAL_DATA_DIR || '.dev-data')
}

// Sesi WhatsApp mengikuti driver yang sama:
// - supabase: usePostgresAuthState dari library (terkonfirmasi di README v1.4.7,
//   mengembalikan { state, saveCreds, clearAuth, close }), session bernama "kana".
// - local: useMultiFileAuthState di .dev-data/session (gitignored, dev saja).
export async function createAuthState(storage, env = process.env) {
  if (storage.driver === 'supabase') {
    return usePostgresAuthState({ pool: storage.pool, session: env.BOT_SESSION || 'kana' })
  }
  return useMultiFileAuthState(`${env.LOCAL_DATA_DIR || '.dev-data'}/session`)
}
