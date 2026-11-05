// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "kencan",
  alias: [],
  category: "rpg",
  description: { id: "Kencan dengan pasanganmu: koin dan XP untuk berdua, cooldown 6 jam", en: "Date your partner: coins and XP for both, 6 hour cooldown" },
  usage: ".kencan",
  example: ".kencan",
  cooldown: 5,
}

export const i18n = {
  id: { "kencan": {
    "single": "╭─❏ 💕 「 *KENCAN* 」\n┊ Kencan butuh pasangan. Lamar dulu pakai .marry~\n╰━━━━━━━",
    "wait": "╭─❏ 💕 「 *KENCAN* 」\n┊ Baru kencan tadi. Pasanganmu butuh istirahat, coba *{hours} jam* lagi~\n╰━━━━━━━",
    "done": "╭─❏ 💕 「 *KENCAN* 」\n┊ Kencan seru bareng *{partner}*! Momen manis bernilai *+{coins} KOIN* dan +10 XP buat kalian berdua.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "kencan": {
    "single": "╭─❏ 💕 「 *DATE* 」\n┊ Dating needs a partner. Propose first with .marry~\n╰━━━━━━━",
    "wait": "╭─❏ 💕 「 *DATE* 」\n┊ You just had a date. Your partner needs rest, try again in *{hours} hours*~\n╰━━━━━━━",
    "done": "╭─❏ 💕 「 *DATE* 」\n┊ A lovely date with *{partner}*! Sweet moments worth *+{coins} COINS* and +10 XP for both of you.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".kencan", expect: /kencan butuh pasangan|dating needs a partner|kencan seru|lovely date/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.partner) return ctx.reply(ctx.t('kencan.single'))
  const now = Date.now()
  const last = Number(profile.last_kencan) || 0
  const cdMs = 6 * 3600000
  if (now - last < cdMs) return ctx.reply(ctx.t('kencan.wait', { hours: Math.ceil((cdMs - (now - last)) / 3600000) }))
  const coins = 50 + Math.floor(Math.random() * 100)
  profile.balance = (profile.balance ?? 0) + coins
  profile.last_kencan = now
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, profile.partner, 10)
  const gain = await addXp(ctx.storage, ctx.senderDigits, 10)
  return ctx.reply(ctx.t('kencan.done', { partner: profile.partner, coins, balance: gain.profile.balance ?? profile.balance }))
}
