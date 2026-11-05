// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="spend"
// hanya memotong saldo rumus generik dan efeknya tidak disimpan. Sekarang
// membeli poin Speed nyata yang tersimpan di profile.stats dan dibaca
// powerOf (duel, dungeon, arena, battle) serta tampil di .skill.
import { buyStat, statsOf } from '../../src/rpg/stats.js'
import { powerOf } from '../../src/rpg/engine.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'buyspeed',
  alias: [],
  category: 'rpg',
  description: { id: 'Beli poin Speed permanen: tersimpan di profil dan menaikkan power tempurmu', en: 'Buy permanent Speed points: stored on your profile and raises your battle power' },
  usage: '.buyspeed [jumlah]',
  example: '.buyspeed 2',
  cooldown: 5,
}

export const i18n = {
  id: {
    buyspeed: {
      done: '╭─❏ 💨 「 *BUYSPEED* 」\n┊ Speed naik jadi *{value}* (+{qty}) seharga *{cost} koin*\n┊ Power tempur sekarang: *{power}*\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYSPEED* 」\n┊ Saldo kurang: butuh *{cost} koin*, saldomu *{balance} koin*. Speed kamu sekarang *{value}*\n╰━━━━━━━',
    },
  },
  en: {
    buyspeed: {
      done: '╭─❏ 💨 「 *BUYSPEED* 」\n┊ Your Speed is now *{value}* (+{qty}) for *{cost} coins*\n┊ Battle power now: *{power}*\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYSPEED* 」\n┊ Not enough coins: needs *{cost} coins*, you have *{balance} coins*. Your Speed is *{value}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.buyspeed 1', expect: /speed naik|speed kamu sekarang|your speed is/i }

export async function handler(ctx) {
  const qty = Math.max(1, Math.min(20, Math.floor(Number((ctx.args ?? [])[0]) || 1)))
  const before = await getProfile(ctx.storage, ctx.senderDigits)
  const res = await buyStat(ctx.storage, ctx.senderDigits, 'speed', qty)
  if (!res.ok) {
    return ctx.reply(ctx.t('buyspeed.poor', { cost: res.cost ?? 0, balance: before.balance ?? 0, value: statsOf(before).speed }))
  }
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('buyspeed.done', { value: res.value, qty: res.qty, cost: res.cost, power: powerOf(fresh), balance: res.balance }))
}
