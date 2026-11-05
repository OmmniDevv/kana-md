// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
export const config = {
  name: "penjaralist",
  alias: [],
  category: "rpg",
  description: { id: "Daftar semua pemain yang sedang dipenjara saat ini, dari data profil nyata", en: "List of all players currently jailed, from real profile data" },
  usage: ".penjaralist",
  example: ".penjaralist",
  cooldown: 5,
}

export const i18n = {
  id: { "penjaralist": {
    "empty": "╭─❏ 🕊️ 「 *PENJARA* 」\n┊ Penjara kosong, tidak ada yang sedang ditahan~\n╰━━━━━━━",
    "list": "╭─❏ 🚔 「 *DAFTAR TAHANAN* 」 ({count})\n┊ {list}\n╰━━━━━━━"
} },
  en: { "penjaralist": {
    "empty": "╭─❏ 🕊️ 「 *JAIL* 」\n┊ The jail is empty, nobody is detained~\n╰━━━━━━━",
    "list": "╭─❏ 🚔 「 *INMATE LIST* 」 ({count})\n┊ {list}\n╰━━━━━━━"
} },
}

export const test = { input: ".penjaralist", expect: /penjara kosong|jail is empty|daftar tahanan|inmate list/i }
export async function handler(ctx) {

  let keys = []
  try { keys = await ctx.storage.keys('users') } catch { keys = [] }
  const rows = []
  for (const key of keys) {
    if (!/^\d+$/.test(key)) continue
    const p = await getProfile(ctx.storage, key)
    if (isJailed(p)) rows.push({ digits: key, minutes: jailMinutesLeft(p) })
  }
  rows.sort((a, b) => b.minutes - a.minutes)
  if (!rows.length) return ctx.reply(ctx.t('penjaralist.empty'))
  const list = rows.slice(0, 15).map((r, i) => (i + 1) + '. ' + r.digits + ' (' + r.minutes + ' mnt)').join('\n┊ ')
  return ctx.reply(ctx.t('penjaralist.list', { count: rows.length, list }))
}
