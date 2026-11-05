// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { claim } from '../../src/rpg/engine.js'
export const config = {
  name: "airdrop",
  alias: [],
  category: "rpg",
  description: { id: "Airdrop per jam lewat mesin klaim: 100 koin dan 5 XP tiap jam", en: "Hourly airdrop via the claim engine: 100 coins and 5 XP every hour" },
  usage: ".airdrop",
  example: ".airdrop",
  cooldown: 5,
}

export const i18n = {
  id: { "airdrop": {
    "done": "╭─❏ 🪂 「 *AIRDROP* 」\n┊ Airdrop jatuh tepat di lokasimu.\n┊ HADIAH: *+{coins} KOIN* | XP: *+{xp}*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *AIRDROP* 」\n┊ Sudah diambil. Kembali lagi sekitar *{hours} jam* lagi yaa~\n╰━━━━━━━"
} },
  en: { "airdrop": {
    "done": "╭─❏ 🪂 「 *AIRDROP* 」\n┊ The airdrop landed right at your spot.\n┊ REWARD: *+{coins} COINS* | XP: *+{xp}*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *AIRDROP* 」\n┊ Already claimed. Come back in about *{hours} hours*~\n╰━━━━━━━"
} },
}

export const test = { input: ".airdrop", expect: /hadiah|reward|sudah diambil|already claimed/i }
export async function handler(ctx) {

  const result = await claim(ctx.storage, ctx.senderDigits, 'hourly')
  if (!result.ok) return ctx.reply(ctx.t('airdrop.wait', { hours: Math.ceil((result.waitMs ?? 0) / 3600000) }))
  return ctx.reply(ctx.t('airdrop.done', { coins: result.reward.coins, xp: result.reward.xp, balance: result.balance }))
}
