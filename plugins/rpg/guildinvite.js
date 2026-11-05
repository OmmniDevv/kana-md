// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "guildinvite",
  alias: [],
  category: "rpg",
  description: { id: "Undang pemain ke guildmu (pemilik/staff); undangan tersimpan dan menunggu jawaban", en: "Invite a player to your guild (owner/staff); the invitation is stored pending an answer" },
  usage: ".guildinvite <target>",
  example: ".guildinvite <target>",
  cooldown: 5,
}

export const i18n = {
  id: { "guildinvite": {
    "none": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━",
    "notStaff": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ Hanya pemilik dan staff guild yang bisa mengundang~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ Undang siapa? Mention atau tulis nomornya: *.guildinvite 628XXXX*\n╰━━━━━━━",
    "self": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ Kamu sudah di dalam guild ini~\n╰━━━━━━━",
    "hasGuild": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ Target sudah punya guild lain~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ UNDANGAN TERKIRIM ke *{target}* buat gabung *{guild}*.\n┊ Dia bisa menerima pakai .guildaccept\n╰━━━━━━━"
} },
  en: { "guildinvite": {
    "none": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━",
    "notStaff": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ Only the guild owner and staff can invite~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ Invite whom? Mention or type the number: *.guildinvite 628XXXX*\n╰━━━━━━━",
    "self": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ You are already in this guild~\n╰━━━━━━━",
    "hasGuild": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ The target already has another guild~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *GUILDINVITE* 」\n┊ INVITE SENT to *{target}* to join *{guild}*.\n┊ They can accept with .guildaccept\n╰━━━━━━━"
} },
}

export const test = { input: ".guildinvite 6281234567890", expect: /undangan terkirim|invite sent|belum punya guild|no guild|pemilik dan staff/i }
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
  if (!clan) return ctx.reply(ctx.t('guildinvite.none'))
  const isStaff = clan.owner === ctx.senderDigits || (clan.roles ?? {})[ctx.senderDigits] === 'staff'
  if (!isStaff) return ctx.reply(ctx.t('guildinvite.notStaff'))
  if (!targetDigits) return ctx.reply(ctx.t('guildinvite.noTarget'))
  if (targetDigits === ctx.senderDigits) return ctx.reply(ctx.t('guildinvite.self'))
  const target = await getProfile(ctx.storage, targetDigits)
  if (target.clanId) return ctx.reply(ctx.t('guildinvite.hasGuild'))
  clan.invites = [...new Set([...(clan.invites ?? []), targetDigits])]
  await ctx.storage.set('clans', clan.id, clan)
  await updateProfile(ctx.storage, targetDigits, { guildInvite: clan.id })
  return ctx.reply(ctx.t('guildinvite.done', { target: targetDigits, guild: clan.name }))
}
