// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "joinguild",
  alias: [],
  category: "rpg",
  description: { id: "Gabung guild yang sudah ada dengan ID guildnya", en: "Join an existing guild by its guild ID" },
  usage: ".joinguild <id>",
  example: ".joinguild <id>",
  cooldown: 5,
}

export const i18n = {
  id: { "joinguild": {
    "usage": "╭─❏ 🏰 「 *JOINGUILD* 」\n┊ Tulis ID guildnya: *.joinguild <id>*\n╰━━━━━━━",
    "fail": "╭─❏ 🏰 「 *JOINGUILD* 」\n┊ Gagal gabung ({reason}). Cek ID guildnya~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *JOINGUILD* 」\n┊ SELAMAT DATANG DI *{guild}*! Total member sekarang: *{members}*\n╰━━━━━━━"
} },
  en: { "joinguild": {
    "usage": "╭─❏ 🏰 「 *JOINGUILD* 」\n┊ Type the guild ID: *.joinguild <id>*\n╰━━━━━━━",
    "fail": "╭─❏ 🏰 「 *JOINGUILD* 」\n┊ Failed to join ({reason}). Check the guild ID~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *JOINGUILD* 」\n┊ WELCOME TO *{guild}*! Members now: *{members}*\n╰━━━━━━━"
} },
}

export const test = { input: ".joinguild naga-emas", expect: /selamat datang|welcome|gagal gabung|failed to join/i }
export async function handler(ctx) {

  const id = ((ctx.args ?? [])[0] || '').toLowerCase()
  if (!id) return ctx.reply(ctx.t('joinguild.usage'))
  const result = await joinClan(ctx.storage, ctx.senderDigits, id)
  if (!result.ok) return ctx.reply(ctx.t('joinguild.fail', { reason: result.reason }))
  return ctx.reply(ctx.t('joinguild.done', { guild: result.clan.name, members: (result.clan.members ?? []).length }))
}
