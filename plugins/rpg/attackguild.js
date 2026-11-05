// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { createClan, joinClan, getClan, clanPower, clanWar } from '../../src/rpg/engine.js'
import { reasonText } from '../../src/rpg/reasons.js'
export const config = {
  name: "attackguild",
  alias: [],
  category: "rpg",
  description: { id: "Serang guild lain lewat mesin perang clan: power gabungan menentukan, hadiah masuk bank guild", en: "Attack another guild via the clan war engine: combined power decides, rewards go to the guild bank" },
  usage: ".attackguild",
  example: ".attackguild",
  cooldown: 5,
}

export const i18n = {
  id: { "attackguild": {
    "fail": "╭─❏ ⚔️ 「 *ATTACKGUILD* 」\n┊ Serangan belum bisa jalan ({reason}). Kamu butuh guild dulu, dan perang hanya sekali sehari~\n╰━━━━━━━",
    "win": "╭─❏ ⚔️ 「 *ATTACKGUILD* 」\n┊ MENANG! *{mine}* ({myPower}) mengalahkan *{opp}* ({oppPower}).\n┊ BANK GUILD +{reward} KOIN, total *{bank}*\n╰━━━━━━━",
    "lose": "╭─❏ ⚔️ 「 *ATTACKGUILD* 」\n┊ KALAH~ *{mine}* ({myPower}) tumbang lawan *{opp}* ({oppPower}).\n┊ BANK GUILD TETAP +{reward} KOIN, total *{bank}*\n╰━━━━━━━"
} },
  en: { "attackguild": {
    "fail": "╭─❏ ⚔️ 「 *ATTACKGUILD* 」\n┊ The attack cannot run yet ({reason}). You need a guild first, and war runs once a day~\n╰━━━━━━━",
    "win": "╭─❏ ⚔️ 「 *ATTACKGUILD* 」\n┊ VICTORY! *{mine}* ({myPower}) beat *{opp}* ({oppPower}).\n┊ GUILD BANK +{reward} COINS, total *{bank}*\n╰━━━━━━━",
    "lose": "╭─❏ ⚔️ 「 *ATTACKGUILD* 」\n┊ DEFEAT~ *{mine}* ({myPower}) fell to *{opp}* ({oppPower}).\n┊ GUILD BANK STILL +{reward} COINS, total *{bank}*\n╰━━━━━━━"
} },
}

export const test = { input: ".attackguild", expect: /menang|kalah|victory|defeat|belum bisa jalan|cannot run/i }
export async function handler(ctx) {

  const result = await clanWar(ctx.storage, ctx.senderDigits)
  if (!result.ok) return ctx.reply(ctx.t('attackguild.fail', { reason: reasonText(result.reason, ctx.lang) }))
  return ctx.reply(ctx.t(result.win ? 'attackguild.win' : 'attackguild.lose', { mine: result.myClan, opp: result.oppName, myPower: result.myPower, oppPower: result.oppPower, reward: result.reward, bank: result.clanBank }))
}
