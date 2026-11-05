// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildinfoacc",
  alias: [],
  category: "rpg",
  description: { id: "Lihat detail undangan guild yang sedang menunggumu sebelum memutuskan", en: "See the details of the guild invitation waiting for you before deciding" },
  usage: ".guildinfoacc",
  example: ".guildinfoacc",
  cooldown: 5,
}

export const i18n = {
  id: { "guildinfoacc": {
    "none": "╭─❏ 🏰 「 *UNDANGAN GUILD* 」\n┊ Tidak ada undangan guild yang menunggu buatmu~\n╰━━━━━━━",
    "gone": "╭─❏ 🏰 「 *UNDANGAN GUILD* 」\n┊ Guild pengundang sudah tidak ada, undangan dibersihkan.\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *UNDANGAN GUILD* 」\n┊ Kamu diundang gabung *{guild}* (ID: {id})\n┊ PEMILIK: *{owner}* | MEMBER: *{members}* | POWER: *{power}*\n┊ Terima pakai .guildaccept, tolak pakai .guilddecline\n╰━━━━━━━"
} },
  en: { "guildinfoacc": {
    "none": "╭─❏ 🏰 「 *GUILD INVITATION* 」\n┊ No guild invitation is waiting for you~\n╰━━━━━━━",
    "gone": "╭─❏ 🏰 「 *GUILD INVITATION* 」\n┊ The inviting guild no longer eXists, the invitation was cleaned.\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *GUILD INVITATION* 」\n┊ You are invited to join *{guild}* (ID: {id})\n┊ OWNER: *{owner}* | MEMBERS: *{members}* | POWER: *{power}*\n┊ Accept with .guildaccept, decline with .guilddecline\n╰━━━━━━━"
} },
}

export const test = { input: ".guildinfoacc", expect: /tidak ada undangan|no guild invitation|diundang gabung|invited to join/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inviteId = profile.guildInvite || ''
  if (!inviteId) return ctx.reply(ctx.t('guildinfoacc.none'))
  const clan = await getClan(ctx.storage, inviteId)
  if (!clan) { await updateProfile(ctx.storage, ctx.senderDigits, { guildInvite: '' }); return ctx.reply(ctx.t('guildinfoacc.gone')) }
  const power = await clanPower(ctx.storage, clan)
  return ctx.reply(ctx.t('guildinfoacc.info', { guild: clan.name, id: clan.id, owner: clan.owner, members: (clan.members ?? []).length, power }))
}
