// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="spend"
// memotong saldo tanpa efek tersimpan. Sekarang konversi nyata dua arah
// dengan .buykoin: DM (diamond) disimpan di profile.dm. Kurs dinyatakan:
// beli 1 DM = 1000 koin, jual 1 DM = 900 koin (lihat buykoin.js).
import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const DM_BUY_RATE = 1000
export const config = {
  name: 'buydm',
  alias: [],
  category: 'rpg',
  description: { id: 'Beli DM (diamond) pakai koin: 1 DM = 1000 koin, tersimpan di profilmu', en: 'Buy DM (diamonds) with coins: 1 DM = 1000 coins, stored on your profile' },
  usage: '.buydm [jumlah DM]',
  example: '.buydm 2',
  cooldown: 5,
}

export const i18n = {
  id: {
    buydm: {
      done: '╭─❏ 💠 「 *BUYDM* 」\n┊ Kamu beli *{qty} DM* seharga *{cost} koin* (kurs 1 DM = 1000 koin)\n┊ DM kamu sekarang: *{dm} DM*\n┊ Saldo: *{balance} koin*\n┊ Jual lagi pakai .buykoin\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYDM* 」\n┊ Saldo kurang: *{qty} DM* butuh *{cost} koin*, saldomu *{balance} koin*. DM kamu sekarang *{dm} DM*\n╰━━━━━━━',
    },
  },
  en: {
    buydm: {
      done: '╭─❏ 💠 「 *BUYDM* 」\n┊ You bought *{qty} DM* for *{cost} coins* (rate 1 DM = 1000 coins)\n┊ Your DM is now: *{dm} DM*\n┊ Balance: *{balance} coins*\n┊ Sell back with .buykoin\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *BUYDM* 」\n┊ Not enough coins: *{qty} DM* needs *{cost} coins*, you have *{balance} coins*. Your DM is *{dm} DM*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.buydm 1', expect: /dm kamu sekarang|saldo kurang|your dm is/i }

export async function handler(ctx) {
  const qty = Math.max(1, Math.min(100, Math.floor(Number((ctx.args ?? [])[0]) || 1)))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const cost = qty * DM_BUY_RATE
  const dm = Math.max(0, Math.floor(Number(profile.dm) || 0))
  if ((profile.balance ?? 0) < cost) {
    return ctx.reply(ctx.t('buydm.poor', { qty, cost, balance: profile.balance ?? 0, dm }))
  }
  const balance = (profile.balance ?? 0) - cost
  await updateProfile(ctx.storage, ctx.senderDigits, { balance, dm: dm + qty })
  return ctx.reply(ctx.t('buydm.done', { qty, cost, dm: dm + qty, balance }))
}
