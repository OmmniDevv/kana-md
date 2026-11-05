// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "resetbansos",
  alias: [],
  category: "rpg",
  description: { id: "Owner: reset cooldown bansos semua pengguna", en: "Owner: reset the social aid cooldown for all users" },
  usage: ".resetbansos",
  example: ".resetbansos",
  isOwner: true,
  cooldown: 5,
}

export const i18n = {
  id: { "resetbansos": {
    "done": "╭─❏ 🧺 「 *RESET BANSOS* 」\n┊ Cooldown bansos *{count} pengguna* sudah direset. Mereka bisa ambil bansos lagi hari ini.\n╰━━━━━━━"
} },
  en: { "resetbansos": {
    "done": "╭─❏ 🧺 「 *RESET BANSOS* 」\n┊ Social aid cooldown for *{count} users* has been reset. They can claim aid again today.\n╰━━━━━━━"
} },
}

export const test = { input: ".resetbansos", expect: /cooldown bansos|social aid cooldown/i }
export async function handler(ctx) {

  let keys = []
  try { keys = await ctx.storage.keys('users') } catch { keys = [] }
  let count = 0
  for (const key of keys) {
    if (!/^\d+$/.test(key)) continue
    const p = await getProfile(ctx.storage, key)
    if (p.last_bansos) { delete p.last_bansos; await saveProfile(ctx.storage, key, p); count++ }
  }
  return ctx.reply(ctx.t('resetbansos.done', { count }))
}
