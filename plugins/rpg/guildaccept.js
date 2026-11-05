// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
import { reasonText } from '../../src/rpg/reasons.js'
export const config = {
  name: "guildaccept",
  alias: [],
  category: "rpg",
  description: { id: "Terima undangan guild yang menunggumu dan gabung seketika", en: "Accept the guild invitation waiting for you and join instantly" },
  usage: ".guildaccept",
  example: ".guildaccept",
  cooldown: 5,
}

export const i18n = {
  id: { "guildaccept": {
    "none": "╭─❏ 🏰 「 *GUILDACCEPT* 」\n┊ Tidak ada undangan guild yang menunggu buatmu~\n╰━━━━━━━",
    "fail": "╭─❏ 🏰 「 *GUILDACCEPT* 」\n┊ Undangan tidak bisa diterima ({reason}) dan sudah hangus.\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDACCEPT* 」\n┊ UNDANGAN DITERIMA! Selamat datang di *{guild}* ({members} member)\n╰━━━━━━━"
} },
  en: { "guildaccept": {
    "none": "╭─❏ 🏰 「 *GUILDACCEPT* 」\n┊ No guild invitation is waiting for you~\n╰━━━━━━━",
    "fail": "╭─❏ 🏰 「 *GUILDACCEPT* 」\n┊ The invitation could not be accepted ({reason}) and has eXpired.\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDACCEPT* 」\n┊ INVITE ACCEPTED! Welcome to *{guild}* ({members} members)\n╰━━━━━━━"
} },
}

export const test = { input: ".guildaccept", expect: /tidak ada undangan|no guild invitation|undangan diterima|invite accepted/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inviteId = profile.guildInvite || ''
  if (!inviteId) return ctx.reply(ctx.t('guildaccept.none'))
  const result = await joinClan(ctx.storage, ctx.senderDigits, inviteId)
  if (!result.ok) {
    await updateProfile(ctx.storage, ctx.senderDigits, { guildInvite: '' })
    return ctx.reply(ctx.t('guildaccept.fail', { reason: reasonText(result.reason, ctx.lang) }))
  }
  const clan = result.clan
  clan.invites = (clan.invites ?? []).filter((d) => d !== ctx.senderDigits)
  await ctx.storage.set('clans', clan.id, clan)
  await updateProfile(ctx.storage, ctx.senderDigits, { guildInvite: '' })
  return ctx.reply(ctx.t('guildaccept.done', { guild: clan.name, members: (clan.members ?? []).length }))
}
