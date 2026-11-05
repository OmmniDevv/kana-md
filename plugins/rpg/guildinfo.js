// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildinfo",
  alias: [],
  category: "rpg",
  description: { id: "Info detail guild: pemilik, bank, power gabungan terhitung, daftar member", en: "Detailed guild info: owner, bank, computed combined power, member list" },
  usage: ".guildinfo [id]",
  example: ".guildinfo [id]",
  cooldown: 5,
}

export const i18n = {
  id: { "guildinfo": {
    "none": "╭─❏ 🏰 「 *GUILDINFO* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *GUILDINFO* 」\n┊ NAMA: *{guild}* (ID: {id})\n┊ PEMILIK: *{owner}*\n┊ MEMBER: *{members}* | BANK GUILD: *{bank} KOIN*\n┊ POWER GABUNGAN: *{power}* | PERANMU: *{role}*\n┊ DAFTAR MEMBER: {memberList}\n╰━━━━━━━"
} },
  en: { "guildinfo": {
    "none": "╭─❏ 🏰 「 *GUILDINFO* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "info": "╭─❏ 🏰 「 *GUILDINFO* 」\n┊ NAME: *{guild}* (ID: {id})\n┊ OWNER: *{owner}*\n┊ MEMBERS: *{members}* | GUILD BANK: *{bank} COINS*\n┊ COMBINED POWER: *{power}* | YOUR ROLE: *{role}*\n┊ MEMBER LIST: {memberList}\n╰━━━━━━━"
} },
}

export const test = { input: ".guildinfo", expect: /nama:|name:|belum punya guild|no guild/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const argId = ((ctx.args ?? [])[0] || '').toLowerCase()
  const clan = await getClan(ctx.storage, argId || profile.clanId)
  if (!clan) return ctx.reply(ctx.t('guildinfo.none'))
  const power = await clanPower(ctx.storage, clan)
  const role = clan.owner === ctx.senderDigits ? 'Pemilik' : ((clan.roles ?? {})[ctx.senderDigits] === 'staff' ? 'Staff' : ((clan.members ?? []).includes(ctx.senderDigits) ? 'Member' : '-'))
  const memberList = (clan.members ?? []).slice(0, 15).join(', ')
  return ctx.reply(ctx.t('guildinfo.info', { guild: clan.name, id: clan.id, owner: clan.owner, members: (clan.members ?? []).length, bank: clan.bank ?? 0, power, role, memberList }))
}
