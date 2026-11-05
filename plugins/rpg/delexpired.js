// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "delexpired",
  alias: [],
  category: "rpg",
  description: { id: "Bersihkan cooldown kedaluwarsa dari profilmu sendiri", en: "Clean expired cooldowns from your own profile" },
  usage: ".delexpired",
  example: ".delexpired",
  cooldown: 5,
}

export const i18n = {
  id: { "delexpired": {
    "done": "╭─❏ 🧹 「 *DELEXPIRED* 」\n┊ Beres: *{count} cooldown kedaluwarsa* dibersihkan dari profilmu.\n╰━━━━━━━"
} },
  en: { "delexpired": {
    "done": "╭─❏ 🧹 「 *DELEXPIRED* 」\n┊ Done: *{count} eXpired cooldowns* cleaned from your profile.\n╰━━━━━━━"
} },
}

export const test = { input: ".delexpired", expect: /cooldown kedaluwarsa|expired cooldowns/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const now = Date.now()
  let cleared = 0
  for (const key of Object.keys(profile)) {
    const value = profile[key]
    if (key === 'jailUntil' && typeof value === 'number' && value > 0 && value <= now) { profile.jailUntil = 0; cleared++ }
    else if (key.startsWith('last_') && typeof value === 'number' && value > 0 && value <= now) { delete profile[key]; cleared++ }
  }
  if (cleared > 0) await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('delexpired.done', { count: cleared }))
}
