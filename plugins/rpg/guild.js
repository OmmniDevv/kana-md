// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guild",
  alias: [],
  category: "rpg",
  description: { id: "Info ringkas guildmu dari data guild tersimpan", en: "Short info about your guild from stored guild data" },
  usage: ".guild [id]",
  example: ".guild [id]",
  cooldown: 5,
}

export const i18n = {
  id: { "guild": {
    "none": "╭─❏ 🏰 「 *GUILD* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *GUILD* 」\n┊ NAMA: *{guild}* (ID: {id})\n┊ PEMILIK: *{owner}*\n┊ MEMBER: *{members}* | BANK: *{bank} KOIN* | POWER: *{power}*\n┊ PERANMU: *{role}*\n╰━━━━━━━"
} },
  en: { "guild": {
    "none": "╭─❏ 🏰 「 *GUILD* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *GUILD* 」\n┊ NAME: *{guild}* (ID: {id})\n┊ OWNER: *{owner}*\n┊ MEMBERS: *{members}* | BANK: *{bank} COINS* | POWER: *{power}*\n┊ YOUR ROLE: *{role}*\n╰━━━━━━━"
} },
}

export const test = { input: ".guild", expect: /nama:|name:|belum punya guild|no guild/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const argId = ((ctx.args ?? [])[0] || '').toLowerCase()
  const clan = await getClan(ctx.storage, argId || profile.clanId)
  if (!clan) return ctx.reply(ctx.t('guild.none'))
  const power = await clanPower(ctx.storage, clan)
  const role = clan.owner === ctx.senderDigits ? 'Pemilik' : ((clan.roles ?? {})[ctx.senderDigits] === 'staff' ? 'Staff' : ((clan.members ?? []).includes(ctx.senderDigits) ? 'Member' : '-'))
  
  return ctx.reply(ctx.t('guild.info', { guild: clan.name, id: clan.id, owner: clan.owner, members: (clan.members ?? []).length, bank: clan.bank ?? 0, power, role }))
}
