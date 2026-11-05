// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildpromote",
  alias: [],
  category: "rpg",
  description: { id: "Angkat member jadi staff guild (khusus pemilik); peran tersimpan di data guild", en: "Promote a member to guild staff (owner only); the role is stored in guild data" },
  usage: ".guildpromote <target>",
  example: ".guildpromote <target>",
  cooldown: 5,
}

export const i18n = {
  id: { "guildpromote": {
    "none": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "notOwner": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ Hanya pemilik guild yang bisa mengatur staff~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ Targetnya siapa? Mention atau tulis nomornya~\n╰━━━━━━━",
    "notMember": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ Target bukan member guild ini~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ *{target}* naik jadi staff guild *{guild}*.\n╰━━━━━━━"
} },
  en: { "guildpromote": {
    "none": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "notOwner": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ Only the guild owner can manage staff~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ Who is the target? Mention or type the number~\n╰━━━━━━━",
    "notMember": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ The target is not a member of this guild~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDPROMOTE* 」\n┊ *{target}* was promoted to staff of guild *{guild}*.\n╰━━━━━━━"
} },
}

export const test = { input: ".guildpromote 6281234567890", expect: /belum punya guild|no guild|pemilik guild|guild owner|bukan member|not a member/i }
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
  if (!clan) return ctx.reply(ctx.t('guildpromote.none'))
  if (clan.owner !== ctx.senderDigits) return ctx.reply(ctx.t('guildpromote.notOwner'))
  if (!targetDigits) return ctx.reply(ctx.t('guildpromote.noTarget'))
  if (!(clan.members ?? []).includes(targetDigits)) return ctx.reply(ctx.t('guildpromote.notMember'))
  clan.roles = clan.roles ?? {}
  clan.roles[targetDigits] = 'staff'
  await ctx.storage.set('clans', clan.id, clan)
  return ctx.reply(ctx.t('guildpromote.done', { target: targetDigits, guild: clan.name }))
}
