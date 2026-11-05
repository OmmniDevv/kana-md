// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "leaderboard-orang-miskin",
  alias: [],
  category: "economy",
  description: { id: "Peringkat saldo koin terendah semua pemain dari data profil nyata", en: "Lowest coin balance ranking of all players from real profile data" },
  usage: ".leaderboard-orang-miskin",
  example: ".leaderboard-orang-miskin",
  cooldown: 5,
}

export const i18n = {
  id: { "leaderboard-orang-miskin": {
    "empty": "╭─❏ 🏆 「 *LEADERBOARD ORANG MISKIN* 」\n┊ Belum ada data pemain~\n╰━━━━━━━",
    "list": "╭─❏ 🏆 「 *LEADERBOARD ORANG MISKIN* 」\n┊ {list}\n╰━━━━━━━"
} },
  en: { "leaderboard-orang-miskin": {
    "empty": "╭─❏ 🏆 「 *LEADERBOARD ORANG MISKIN* 」\n┊ No player data yet~\n╰━━━━━━━",
    "list": "╭─❏ 🏆 「 *LEADERBOARD ORANG MISKIN* 」\n┊ {list}\n╰━━━━━━━"
} },
}

export const test = { input: ".leaderboard-orang-miskin", expect: /koin, lv|belum ada data|no player data/i }
export async function handler(ctx) {

  let keys = []
  try { keys = await ctx.storage.keys('users') } catch { keys = [] }
  const rows = []
  for (const key of keys) {
    if (!/^\d+$/.test(key)) continue
    const p = await getProfile(ctx.storage, key)
    rows.push({ digits: key, name: p.regName || p.name || '', balance: p.balance ?? 0, level: levelFromXp(p.xp ?? 0) })
  }
  rows.sort((a, b) => a.balance - b.balance)
  const top = rows.slice(0, 10)
  if (!top.length) return ctx.reply(ctx.t('leaderboard-orang-miskin.empty'))
  const list = top.map((r, i) => (i + 1) + '. ' + (r.name ? r.name + ' ' : '') + '(' + r.digits + ') : ' + r.balance + ' koin, lv' + r.level).join('\n┊ ')
  return ctx.reply(ctx.t('leaderboard-orang-miskin.list', { list }))
}
