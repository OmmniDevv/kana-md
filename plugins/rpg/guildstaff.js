// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildstaff",
  alias: [],
  category: "rpg",
  description: { id: "Daftar pemilik dan staff guildmu dari data guild tersimpan", en: "List of your guild owner and staff from stored guild data" },
  usage: ".guildstaff",
  example: ".guildstaff",
  cooldown: 5,
}

export const i18n = {
  id: { "guildstaff": {
    "none": "╭─❏ 🏰 「 *GUILDSTAFF* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *GUILDSTAFF* 」 *{guild}*\n┊ PEMILIK: *{owner}*\n┊ STAFF ({count}): {staff}\n╰━━━━━━━"
} },
  en: { "guildstaff": {
    "none": "╭─❏ 🏰 「 *GUILDSTAFF* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *GUILDSTAFF* 」 *{guild}*\n┊ OWNER: *{owner}*\n┊ STAFF ({count}): {staff}\n╰━━━━━━━"
} },
}

export const test = { input: ".guildstaff", expect: /guildstaff|belum punya guild|no guild/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const clan = await getClan(ctx.storage, profile.clanId)
  if (!clan) return ctx.reply(ctx.t('guildstaff.none'))
  const staff = Object.entries(clan.roles ?? {}).filter(([, r]) => r === 'staff').map(([d]) => d)
  return ctx.reply(ctx.t('guildstaff.info', { guild: clan.name, owner: clan.owner, staff: staff.length ? staff.join(', ') : '-', count: staff.length }))
}
