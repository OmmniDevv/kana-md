// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
export const config = {
  name: "createguild",
  alias: [],
  category: "rpg",
  description: { id: "Buat guild sungguhan: tersimpan di data clan engine, kamu jadi pemiliknya", en: "Create a real guild: stored in the engine clan data, you become its owner" },
  usage: ".createguild <nama>",
  example: ".createguild <nama>",
  cooldown: 5,
}

export const i18n = {
  id: { "createguild": {
    "usage": "╭─❏ 🏰 「 *CREATEGUILD* 」\n┊ Tulis nama guildnya: *.createguild Nama Guild*\n╰━━━━━━━",
    "fail": "╭─❏ 🏰 「 *CREATEGUILD* 」\n┊ Gagal membuat guild ({reason}). Mungkin namanya sudah dipakai atau kamu sudah punya guild~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *CREATEGUILD* 」\n┊ GUILD *{guild}* resmi berdiri! ID: *{id}*\n┊ Ajak temanmu gabung pakai .joinguild {id}\n╰━━━━━━━"
} },
  en: { "createguild": {
    "usage": "╭─❏ 🏰 「 *CREATEGUILD* 」\n┊ Type the guild name: *.createguild Guild Name*\n╰━━━━━━━",
    "fail": "╭─❏ 🏰 「 *CREATEGUILD* 」\n┊ Failed to create the guild ({reason}). The name may be taken or you already have a guild~\n╰━━━━━━━",
    "done": "╭─❏ 🏰 「 *CREATEGUILD* 」\n┊ GUILD *{guild}* is founded! ID: *{id}*\n┊ Invite friends with .joinguild {id}\n╰━━━━━━━"
} },
}

export const test = { input: ".createguild Naga Emas", expect: /resmi berdiri|is founded|gagal membuat|failed to create/i }
export async function handler(ctx) {

  const guildName = (ctx.args ?? []).join(' ').trim()
  if (!guildName) return ctx.reply(ctx.t('createguild.usage'))
  const result = await createClan(ctx.storage, ctx.senderDigits, guildName)
  if (!result.ok) return ctx.reply(ctx.t('createguild.fail', { reason: result.reason }))
  return ctx.reply(ctx.t('createguild.done', { guild: result.clan.name, id: result.clan.id }))
}
