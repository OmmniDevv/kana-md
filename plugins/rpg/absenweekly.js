// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { claim } from '../../src/rpg/engine.js'
export const config = {
  name: "absenweekly",
  alias: [],
  category: "rpg",
  description: { id: "Absen mingguan sungguhan lewat mesin klaim: 3.000 koin dan 100 XP, sekali sepekan", en: "Real weekly check-in via the claim engine: 3,000 coins and 100 XP, once a week" },
  usage: ".absenweekly",
  example: ".absenweekly",
  cooldown: 5,
}

export const i18n = {
  id: { "absenweekly": {
    "done": "╭─❏ 📆 「 *ABSENWEEKLY* 」\n┊ Absen mingguanmu tercatat.\n┊ HADIAH: *+{coins} KOIN* | XP: *+{xp}*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *ABSENWEEKLY* 」\n┊ Sudah diambil. Kembali lagi sekitar *{hours} jam* lagi yaa~\n╰━━━━━━━"
} },
  en: { "absenweekly": {
    "done": "╭─❏ 📆 「 *ABSENWEEKLY* 」\n┊ Your weekly check-in is recorded.\n┊ REWARD: *+{coins} COINS* | XP: *+{xp}*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *ABSENWEEKLY* 」\n┊ Already claimed. Come back in about *{hours} hours*~\n╰━━━━━━━"
} },
}

export const test = { input: ".absenweekly", expect: /hadiah|reward|sudah diambil|already claimed/i }
export async function handler(ctx) {

  const result = await claim(ctx.storage, ctx.senderDigits, 'weekly')
  if (!result.ok) return ctx.reply(ctx.t('absenweekly.wait', { hours: Math.ceil((result.waitMs ?? 0) / 3600000) }))
  return ctx.reply(ctx.t('absenweekly.done', { coins: result.reward.coins, xp: result.reward.xp, balance: result.balance }))
}
