// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
import { duel } from '../../src/rpg/engine.js'
export const config = {
  name: "kill",
  alias: ["bunuh", "membunuh"],
  category: "rpg",
  description: { id: "Duel maut melawan pemain lain lewat mesin duel: power menentukan, yang kalah kehilangan koin. Alias .bunuh/.membunuh", en: "Death duel against another player via the duel engine: power decides, the loser loses coins. Alias .bunuh/.membunuh" },
  usage: ".kill <target>",
  example: ".kill <target>",
  cooldown: 5,
}

export const i18n = {
  id: { "kill": {
    "jailed": "╭─❏ 🚔 「 *KILL* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "noTarget": "╭─❏ ⚔️ 「 *KILL* 」\n┊ Lawannya siapa? Mention, balas pesan, atau tulis nomornya: *.kill 628XXXX*\n┊ Yang kalah kehilangan sampai 100 koin ke pemenang.\n╰━━━━━━━",
    "self": "╭─❏ ⚔️ 「 *KILL* 」\n┊ Tidak bisa melawan diri sendiri~\n╰━━━━━━━",
    "win": "╭─❏ ⚔️ 「 *KILL* 」\n┊ MENANG! Power {powerA} vs {powerB}. Kamu merampas *{coins} KOIN* dari *{target}*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ ⚔️ 「 *KILL* 」\n┊ KALAH~ Power {powerA} vs {powerB}. *{coins} KOIN* melayang ke *{target}*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "kill": {
    "jailed": "╭─❏ 🚔 「 *KILL* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "noTarget": "╭─❏ ⚔️ 「 *KILL* 」\n┊ Who is the opponent? Mention, reply, or type the number: *.kill 628XXXX*\n┊ The loser loses up to 100 coins to the winner.\n╰━━━━━━━",
    "self": "╭─❏ ⚔️ 「 *KILL* 」\n┊ You cannot fight yourself~\n╰━━━━━━━",
    "win": "╭─❏ ⚔️ 「 *KILL* 」\n┊ YOU WIN! Power {powerA} vs {powerB}. You took *{coins} COINS* from *{target}*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "lose": "╭─❏ ⚔️ 「 *KILL* 」\n┊ YOU LOSE~ Power {powerA} vs {powerB}. *{coins} COINS* went to *{target}*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".kill 6281234567890", expect: /menang|kalah|power|you win|you lose/i }
export async function handler(ctx) {

  const targetDigits = (() => {
    const mention = (ctx.mentionedJids ?? [])[0]
    if (mention) return String(mention).split('@')[0].replace(/\D/g, '')
    if (ctx.quoted?.sender) return String(ctx.quoted.sender).split('@')[0].replace(/\D/g, '')
    const num = (ctx.args ?? []).map((a) => String(a).replace(/\D/g, '')).find((a) => a.length >= 9)
    return num || ''
  })()
  if (!targetDigits) return ctx.reply(ctx.t('kill.noTarget'))
  if (targetDigits === ctx.senderDigits) return ctx.reply(ctx.t('kill.self'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('kill.jailed', { minutes: jailMinutesLeft(profile) }))
  const result = await duel(ctx.storage, ctx.senderDigits, targetDigits)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  const won = result.winner === ctx.senderDigits
  return ctx.reply(ctx.t(won ? 'kill.win' : 'kill.lose', { target: targetDigits, coins: result.coins, powerA: result.powerA, powerB: result.powerB, balance: fresh.balance ?? 0 }))
}
