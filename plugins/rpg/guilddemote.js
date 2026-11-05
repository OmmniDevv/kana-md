// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guilddemote",
  alias: [],
  category: "rpg",
  description: { id: "Turunkan staff guild kembali jadi member (khusus pemilik)", en: "Demote a guild staff back to member (owner only)" },
  usage: ".guilddemote <target>",
  example: ".guilddemote <target>",
  cooldown: 5,
}

export const i18n = {
  id: { "guilddemote": {
    "none": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "notOwner": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ Hanya pemilik guild yang bisa mengatur staff~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ Targetnya siapa? Mention atau tulis nomornya~\n╰━━━━━━━",
    "notMember": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ Target bukan member guild ini~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ *{target}* diturunkan dari staff guild *{guild}*.\n╰━━━━━━━"
} },
  en: { "guilddemote": {
    "none": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "notOwner": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ Only the guild owner can manage staff~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ Who is the target? Mention or type the number~\n╰━━━━━━━",
    "notMember": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ The target is not a member of this guild~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDDEMOTE* 」\n┊ *{target}* was demoted from staff of guild *{guild}*.\n╰━━━━━━━"
} },
}

export const test = { input: ".guilddemote 6281234567890", expect: /belum punya guild|no guild|pemilik guild|guild owner|bukan member|not a member/i }
export async function handler(ctx) {

  const targetDigits = (() => {
    const mention = (ctx.mentionedJids ?? [])[0]
    if (mention) return String(mention).split('@')[0].replace(/\D/g, '')
    if (ctx.quoted?.sender) return String(ctx.quoted.sender).split('@')[0].replace(/\D/g, '')
    const num = (ctx.args ?? []).map((a) => String(a).replace(/\D/g, '')).find((a) => a.length >= 9)
    return num || ''
  })()
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const clan = await getClan(ctx.storage, profile.clanId)
  if (!clan) return ctx.reply(ctx.t('guilddemote.none'))
  if (clan.owner !== ctx.senderDigits) return ctx.reply(ctx.t('guilddemote.notOwner'))
  if (!targetDigits) return ctx.reply(ctx.t('guilddemote.noTarget'))
  if (!(clan.members ?? []).includes(targetDigits)) return ctx.reply(ctx.t('guilddemote.notMember'))
  clan.roles = clan.roles ?? {}
  delete clan.roles[targetDigits]
  await ctx.storage.set('clans', clan.id, clan)
  return ctx.reply(ctx.t('guilddemote.done', { target: targetDigits, guild: clan.name }))
}
