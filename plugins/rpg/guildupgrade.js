// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="spend"
// memotong saldo pribadi tanpa efek. Sekarang menaikkan level guild nyata
// (data clan engine, namespace 'clans', sama dengan .guild/.createguild):
// level dihitung dari XP guild, biaya diambil dari KAS guild, hanya pemilik
// guild yang bisa, dan level barunya tersimpan serta terbaca .guild.
import { getProfile } from '../../src/services/user-service.js'
import { getClan } from '../../src/rpg/engine.js'

export const config = {
  name: 'guildupgrade',
  alias: [],
  category: 'rpg',
  description: { id: 'Upgrade level guildmu dari kas guild: level naik beneran dan tersimpan', en: 'Upgrade your guild level from the guild bank: the level really rises and is stored' },
  usage: '.guildupgrade',
  example: '.guildupgrade',
  cooldown: 5,
}

export const i18n = {
  id: {
    guildupgrade: {
      none: '╭─❏ 🏰 「 *GUILDUPGRADE* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━',
      notOwner: '╭─❏ 🏰 「 *GUILDUPGRADE* 」\n┊ Cuma pemilik guild *{guild}* yang bisa upgrade. Pemiliknya: *{owner}*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *GUILDUPGRADE* 」\n┊ Kas guild kurang: upgrade ke level *{next}* butuh *{cost} koin*, kas sekarang *{bank} koin*. Isi kas lewat .clanwar\n┊ Level guild sekarang: *{level}*\n╰━━━━━━━',
      done: '╭─❏ 🏰 「 *GUILDUPGRADE* 」\n┊ Guild *{guild}* naik ke *level {level}*!\n┊ Biaya *{cost} koin* diambil dari kas, sisa kas: *{bank} koin*\n╰━━━━━━━',
    },
  },
  en: {
    guildupgrade: {
      none: '╭─❏ 🏰 「 *GUILDUPGRADE* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━',
      notOwner: '╭─❏ 🏰 「 *GUILDUPGRADE* 」\n┊ Only the owner of guild *{guild}* can upgrade. Owner: *{owner}*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *GUILDUPGRADE* 」\n┊ Guild bank is short: upgrading to level *{next}* needs *{cost} coins*, bank now holds *{bank} coins*. Fill it via .clanwar\n┊ Current guild level: *{level}*\n╰━━━━━━━',
      done: '╭─❏ 🏰 「 *GUILDUPGRADE* 」\n┊ Guild *{guild}* rose to *level {level}*!\n┊ Cost *{cost} coins* taken from the bank, bank left: *{bank} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.guildupgrade', expect: /belum punya guild|no guild yet|naik ke|rose to|level guild sekarang|current guild level|pemilik guild|owner of guild/i }

export function guildLevel(clan) {
  return Math.floor(Math.sqrt((Number(clan?.xp) || 0) / 100)) + 1
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const clan = await getClan(ctx.storage, profile.clanId)
  if (!clan) return ctx.reply(ctx.t('guildupgrade.none'))
  if (clan.owner !== ctx.senderDigits) {
    return ctx.reply(ctx.t('guildupgrade.notOwner', { guild: clan.name, owner: clan.owner }))
  }
  const level = guildLevel(clan)
  const cost = level * 500
  const bank = Number(clan.bank) || 0
  if (bank < cost) {
    return ctx.reply(ctx.t('guildupgrade.poor', { next: level + 1, cost, bank, level }))
  }
  clan.bank = bank - cost
  clan.xp = (Number(clan.xp) || 0) + 100 * level
  await ctx.storage.set('clans', clan.id, clan)
  return ctx.reply(ctx.t('guildupgrade.done', { guild: clan.name, level: guildLevel(clan), cost, bank: clan.bank }))
}
