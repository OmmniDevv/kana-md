// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "absenmonthly",
  alias: [],
  category: "rpg",
  description: { id: "Absen bulanan: 10.000 koin dan 300 XP, sekali sebulan (tanggal WIB)", en: "Monthly check-in: 10,000 coins and 300 XP, once a month (WIB date)" },
  usage: ".absenmonthly",
  example: ".absenmonthly",
  cooldown: 5,
}

export const i18n = {
  id: { "absenmonthly": {
    "done": "╭─❏ 📅 「 *ABSEN BULANAN* 」\n┊ Absen bulanan tercatat! Hadiah *+10.000 KOIN* dan *+300 XP*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wait": "╭─❏ 📅 「 *ABSEN BULANAN* 」\n┊ Bulan ini sudah absen. Bulan depan lagi yaa~\n╰━━━━━━━"
} },
  en: { "absenmonthly": {
    "done": "╭─❏ 📅 「 *MONTHLY CHECK-IN* 」\n┊ Monthly check-in recorded! Reward *+10,000 COINS* and *+300 XP*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wait": "╭─❏ 📅 「 *MONTHLY CHECK-IN* 」\n┊ Already checked in this month. See you neXt month~\n╰━━━━━━━"
} },
}

export const test = { input: ".absenmonthly", expect: /absen bulanan tercatat|monthly check-in recorded|sudah absen|already checked/i }
export async function handler(ctx) {

  const { wibDateString } = await import('../../src/services/user-service.js')
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const month = wibDateString().slice(0, 7)
  if (profile.last_absenmonthly === month) return ctx.reply(ctx.t('absenmonthly.wait'))
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) + 10000, last_absenmonthly: month })
  await addXp(ctx.storage, ctx.senderDigits, 300)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('absenmonthly.done', { balance: fresh.balance ?? 0 }))
}
