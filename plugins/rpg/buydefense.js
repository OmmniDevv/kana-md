// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="spend"
// hanya memotong saldo rumus generik dan efeknya tidak disimpan. Sekarang
// membeli poin Defense nyata yang tersimpan di profile.stats dan dibaca
// powerOf (duel, dungeon, arena, battle) serta tampil di .skill.
import { buyStat, statsOf } from '../../src/rpg/stats.js'
import { powerOf } from '../../src/rpg/engine.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'buydefense',
  alias: [],
  category: 'rpg',
  description: { id: 'Beli poin Defense permanen: tersimpan di profil dan menaikkan power tempurmu', en: 'Buy permanent Defense points: stored on your profile and raises your battle power' },
  usage: '.buydefense [jumlah]',
  example: '.buydefense 2',
  cooldown: 5,
}

export const i18n = {
  id: {
    buydefense: {
      done: '╭─❏ 🛡️ 「 *BUYDEFENSE* 」\n┊ Defense naik jadi *{value}* (+{qty}) seharga *{cost} koin*\n┊ Power tempur sekarang: *{power}*\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYDEFENSE* 」\n┊ Saldo kurang: butuh *{cost} koin*, saldomu *{balance} koin*. Defense kamu sekarang *{value}*\n╰━━━━━━━',
    },
  },
  en: {
    buydefense: {
      done: '╭─❏ 🛡️ 「 *BUYDEFENSE* 」\n┊ Your Defense is now *{value}* (+{qty}) for *{cost} coins*\n┊ Battle power now: *{power}*\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYDEFENSE* 」\n┊ Not enough coins: needs *{cost} coins*, you have *{balance} coins*. Your Defense is *{value}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.buydefense 1', expect: /defense naik|defense kamu sekarang|your defense is/i }

export async function handler(ctx) {
  const qty = Math.max(1, Math.min(20, Math.floor(Number((ctx.args ?? [])[0]) || 1)))
  const before = await getProfile(ctx.storage, ctx.senderDigits)
  const res = await buyStat(ctx.storage, ctx.senderDigits, 'defense', qty)
  if (!res.ok) {
    return ctx.reply(ctx.t('buydefense.poor', { cost: res.cost ?? 0, balance: before.balance ?? 0, value: statsOf(before).defense }))
  }
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('buydefense.done', { value: res.value, qty: res.qty, cost: res.cost, power: powerOf(fresh), balance: res.balance }))
}
