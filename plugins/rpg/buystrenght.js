// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="spend"
// hanya memotong saldo rumus generik dan efeknya tidak disimpan. Sekarang
// membeli poin Strength nyata yang tersimpan di profile.stats dan dibaca
// powerOf (duel, dungeon, arena, battle) serta tampil di .skill.
import { buyStat, statsOf } from '../../src/rpg/stats.js'
import { powerOf } from '../../src/rpg/engine.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'buystrenght',
  alias: [],
  category: 'rpg',
  description: { id: 'Beli poin Strength permanen: tersimpan di profil dan menaikkan power tempurmu', en: 'Buy permanent Strength points: stored on your profile and raises your battle power' },
  usage: '.buystrenght [jumlah]',
  example: '.buystrenght 2',
  cooldown: 5,
}

export const i18n = {
  id: {
    buystrenght: {
      done: '╭─❏ 💪 「 *BUYSTRENGHT* 」\n┊ Strength naik jadi *{value}* (+{qty}) seharga *{cost} koin*\n┊ Power tempur sekarang: *{power}*\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYSTRENGHT* 」\n┊ Saldo kurang: butuh *{cost} koin*, saldomu *{balance} koin*. Strength kamu sekarang *{value}*\n╰━━━━━━━',
    },
  },
  en: {
    buystrenght: {
      done: '╭─❏ 💪 「 *BUYSTRENGHT* 」\n┊ Your Strength is now *{value}* (+{qty}) for *{cost} coins*\n┊ Battle power now: *{power}*\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYSTRENGHT* 」\n┊ Not enough coins: needs *{cost} coins*, you have *{balance} coins*. Your Strength is *{value}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.buystrenght 1', expect: /strength naik|strength kamu sekarang|your strength is/i }

export async function handler(ctx) {
  const qty = Math.max(1, Math.min(20, Math.floor(Number((ctx.args ?? [])[0]) || 1)))
  const before = await getProfile(ctx.storage, ctx.senderDigits)
  const res = await buyStat(ctx.storage, ctx.senderDigits, 'strength', qty)
  if (!res.ok) {
    return ctx.reply(ctx.t('buystrenght.poor', { cost: res.cost ?? 0, balance: before.balance ?? 0, value: statsOf(before).strength }))
  }
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('buystrenght.done', { value: res.value, qty: res.qty, cost: res.cost, power: powerOf(fresh), balance: res.balance }))
}
