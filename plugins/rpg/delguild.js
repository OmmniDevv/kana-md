// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "delguild",
  alias: [],
  category: "rpg",
  description: { id: "Bubarkan guild (khusus pemilik): semua member dikeluarkan, data guild dihapus", en: "Disband the guild (owner only): all members removed, guild data deleted" },
  usage: ".delguild",
  example: ".delguild",
  cooldown: 5,
}

export const i18n = {
  id: { "delguild": {
    "none": "╭─❏ 🏰 「 *DELGUILD* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "notOwner": "╭─❏ 🏰 「 *DELGUILD* 」\n┊ Hanya pemilik guild yang bisa membubarkan guild~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *DELGUILD* 」\n┊ Guild *{guild}* dibubarkan. Semua member dikeluarkan.\n╰━━━━━━━"
} },
  en: { "delguild": {
    "none": "╭─❏ 🏰 「 *DELGUILD* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "notOwner": "╭─❏ 🏰 「 *DELGUILD* 」\n┊ Only the guild owner can disband the guild~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *DELGUILD* 」\n┊ Guild *{guild}* disbanded. All members were removed.\n╰━━━━━━━"
} },
}

export const test = { input: ".delguild", expect: /dibubarkan|disbanded|pemilik guild|guild owner|belum punya guild/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const clan = await getClan(ctx.storage, profile.clanId)
  if (!clan) return ctx.reply(ctx.t('delguild.none'))
  if (clan.owner !== ctx.senderDigits) return ctx.reply(ctx.t('delguild.notOwner'))
  for (const member of clan.members ?? []) {
    const p = await getProfile(ctx.storage, member)
    if (p.clanId === clan.id) await updateProfile(ctx.storage, member, { clanId: '' })
  }
  await ctx.storage.delete('clans', clan.id)
  return ctx.reply(ctx.t('delguild.done', { guild: clan.name }))
}
