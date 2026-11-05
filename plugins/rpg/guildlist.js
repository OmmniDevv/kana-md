// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildlist",
  alias: [],
  category: "rpg",
  description: { id: "Daftar semua guild terdaftar beserta jumlah membernya", en: "List of all registered guilds with their member counts" },
  usage: ".guildlist",
  example: ".guildlist",
  cooldown: 5,
}

export const i18n = {
  id: { "guildlist": {
    "empty": "╭─❏ 🏰 「 *GUILDLIST* 」\n┊ Belum ada guild terdaftar. Buat yang pertama pakai .createguild~\n╰━━━━━━━",
    "list": "╭─❏ 🏰 「 *GUILDLIST* 」\n┊ {list}\n╰━━━━━━━"
} },
  en: { "guildlist": {
    "empty": "╭─❏ 🏰 「 *GUILDLIST* 」\n┊ No guilds registered yet. Create the first one with .createguild~\n╰━━━━━━━",
    "list": "╭─❏ 🏰 「 *GUILDLIST* 」\n┊ {list}\n╰━━━━━━━"
} },
}

export const test = { input: ".guildlist", expect: /belum ada guild|no guilds|member/i }
export async function handler(ctx) {

  let keys = []
  try { keys = await ctx.storage.keys('clans') } catch { keys = [] }
  if (!keys.length) return ctx.reply(ctx.t('guildlist.empty'))
  const rows = []
  for (const key of keys.slice(0, 15)) {
    const clan = await getClan(ctx.storage, key)
    if (clan) rows.push('• ' + clan.name + ' (' + clan.id + ') : ' + (clan.members ?? []).length + ' member')
  }
  if (!rows.length) return ctx.reply(ctx.t('guildlist.empty'))
  return ctx.reply(ctx.t('guildlist.list', { list: rows.join('\n┊ ') }))
}
