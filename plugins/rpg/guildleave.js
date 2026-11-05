// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildleave",
  alias: [],
  category: "rpg",
  description: { id: "Keluar dari guildmu; kepemilikan berpindah atau guild bubar bila kamu yang terakhir", en: "Leave your guild; ownership transfers or the guild disbands if you were the last one" },
  usage: ".guildleave",
  example: ".guildleave",
  cooldown: 5,
}

export const i18n = {
  id: { "guildleave": {
    "none": "╭─❏ 🏰 「 *GUILDLEAVE* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDLEAVE* 」\n┊ Kamu keluar dari guild *{guild}*. Sampai jumpa~\n╰━━━━━━━",
    "disbanded": "╭─❏ 🏰 「 *GUILDLEAVE* 」\n┊ Kamu pemilik terakhir yang keluar, guild *{guild}* bubar.\n╰━━━━━━━"
} },
  en: { "guildleave": {
    "none": "╭─❏ 🏰 「 *GUILDLEAVE* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDLEAVE* 」\n┊ You left the guild *{guild}*. See you~\n╰━━━━━━━",
    "disbanded": "╭─❏ 🏰 「 *GUILDLEAVE* 」\n┊ You were the last owner leaving, guild *{guild}* is disbanded.\n╰━━━━━━━"
} },
}

export const test = { input: ".guildleave", expect: /keluar dari guild|left the guild|belum punya guild|no guild/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const clan = await getClan(ctx.storage, profile.clanId)
  if (!clan) return ctx.reply(ctx.t('guildleave.none'))
  clan.members = (clan.members ?? []).filter((m) => m !== ctx.senderDigits)
  if (clan.owner === ctx.senderDigits) {
    if (clan.members.length) clan.owner = clan.members[0]
    else { await ctx.storage.delete('clans', clan.id); await updateProfile(ctx.storage, ctx.senderDigits, { clanId: '' }); return ctx.reply(ctx.t('guildleave.disbanded', { guild: clan.name })) }
  }
  await ctx.storage.set('clans', clan.id, clan)
  await updateProfile(ctx.storage, ctx.senderDigits, { clanId: '' })
  return ctx.reply(ctx.t('guildleave.done', { guild: clan.name }))
}
