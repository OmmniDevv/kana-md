// Perbaikan audit templat 2026-11-06 (gelombang 2): pasangan konversi
// .buydm. Menjual DM (profile.dm) menjadi koin dengan kurs dinyatakan:
// 1 DM = 900 koin (beli di .buydm 1000 koin, jadi ada selisih kurs).
import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const DM_SELL_RATE = 900
export const config = {
  name: 'buykoin',
  alias: [],
  category: 'rpg',
  description: { id: 'Tukar DM (diamond) jadi koin: 1 DM = 900 koin, saldo bertambah nyata', en: 'Exchange DM (diamonds) into coins: 1 DM = 900 coins, balance really increases' },
  usage: '.buykoin [jumlah DM]',
  example: '.buykoin 2',
  cooldown: 5,
}

export const i18n = {
  id: {
    buykoin: {
      done: '╭─❏ 🪙 「 *BUYKOIN* 」\n┊ Kamu tukar *{qty} DM* jadi *+{gain} koin* (kurs 1 DM = 900 koin)\n┊ DM tersisa: *{dm} DM*\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYKOIN* 」\n┊ DM kamu cuma *{dm} DM*, tidak cukup buat tukar *{qty} DM*. Beli dulu pakai .buydm\n╰━━━━━━━',
    },
  },
  en: {
    buykoin: {
      done: '╭─❏ 🪙 「 *BUYKOIN* 」\n┊ You exchanged *{qty} DM* into *+{gain} coins* (rate 1 DM = 900 coins)\n┊ DM left: *{dm} DM*\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYKOIN* 」\n┊ You only have *{dm} DM*, not enough to exchange *{qty} DM*. Buy first with .buydm\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.buykoin 1', expect: /dm tersisa|dm kamu cuma|dm left|you only have/i }

export async function handler(ctx) {
  const qty = Math.max(1, Math.min(100, Math.floor(Number((ctx.args ?? [])[0]) || 1)))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const dm = Math.max(0, Math.floor(Number(profile.dm) || 0))
  if (dm < qty) return ctx.reply(ctx.t('buykoin.poor', { qty, dm }))
  const gain = qty * DM_SELL_RATE
  const balance = (profile.balance ?? 0) + gain
  await updateProfile(ctx.storage, ctx.senderDigits, { balance, dm: dm - qty })
  return ctx.reply(ctx.t('buykoin.done', { qty, gain, dm: dm - qty, balance }))
}
