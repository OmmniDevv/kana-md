// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guilddecline",
  alias: [],
  category: "rpg",
  description: { id: "Tolak undangan guild yang menunggumu; undangan terhapus dari kedua sisi", en: "Decline the guild invitation waiting for you; it is removed from both sides" },
  usage: ".guilddecline",
  example: ".guilddecline",
  cooldown: 5,
}

export const i18n = {
  id: { "guilddecline": {
    "none": "╭─❏ 🏰 「 *GUILDDECLINE* 」\n┊ Tidak ada undangan guild yang menunggu buatmu~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDDECLINE* 」\n┊ Undangan dari *{guild}* ditolak dan dihapus.\n╰━━━━━━━"
} },
  en: { "guilddecline": {
    "none": "╭─❏ 🏰 「 *GUILDDECLINE* 」\n┊ No guild invitation is waiting for you~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDDECLINE* 」\n┊ The invitation from *{guild}* was declined and removed.\n╰━━━━━━━"
} },
}

export const test = { input: ".guilddecline", expect: /tidak ada undangan|no guild invitation|ditolak|declined/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inviteId = profile.guildInvite || ''
  if (!inviteId) return ctx.reply(ctx.t('guilddecline.none'))
  const clan = await getClan(ctx.storage, inviteId)
  if (clan) {
    clan.invites = (clan.invites ?? []).filter((d) => d !== ctx.senderDigits)
    await ctx.storage.set('clans', clan.id, clan)
  }
  await updateProfile(ctx.storage, ctx.senderDigits, { guildInvite: '' })
  return ctx.reply(ctx.t('guilddecline.done', { guild: clan?.name ?? inviteId }))
}
