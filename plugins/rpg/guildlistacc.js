// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildlistacc",
  alias: [],
  category: "rpg",
  description: { id: "Daftar undangan keluar guildmu yang masih menunggu jawaban", en: "List of your guild's outgoing invitations still waiting for an answer" },
  usage: ".guildlistacc",
  example: ".guildlistacc",
  cooldown: 5,
}

export const i18n = {
  id: { "guildlistacc": {
    "none": "╭─❏ 🏰 「 *GUILDLISTACC* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "empty": "╭─❏ 🏰 「 *UNDANGAN KELUAR* 」\n┊ Guild *{guild}* belum mengundang siapa pun.\n╰━━━━━━━",
    "list": "╭─❏ 🏰 「 *UNDANGAN KELUAR* 」 *{guild}* ({count})\n┊ Menunggu jawaban: {list}\n╰━━━━━━━"
} },
  en: { "guildlistacc": {
    "none": "╭─❏ 🏰 「 *GUILDLISTACC* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "empty": "╭─❏ 🏰 「 *OUTGOING INVITES* 」\n┊ Guild *{guild}* has not invited anyone yet.\n╰━━━━━━━",
    "list": "╭─❏ 🏰 「 *OUTGOING INVITES* 」 *{guild}* ({count})\n┊ Waiting for an answer: {list}\n╰━━━━━━━"
} },
}

export const test = { input: ".guildlistacc", expect: /belum punya guild|no guild|belum mengundang|has not invited|menunggu jawaban/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const clan = await getClan(ctx.storage, profile.clanId)
  if (!clan) return ctx.reply(ctx.t('guildlistacc.none'))
  const invites = clan.invites ?? []
  if (!invites.length) return ctx.reply(ctx.t('guildlistacc.empty', { guild: clan.name }))
  return ctx.reply(ctx.t('guildlistacc.list', { guild: clan.name, count: invites.length, list: invites.join(', ') }))
}
