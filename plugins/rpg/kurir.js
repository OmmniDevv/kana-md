// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "kurir",
  alias: [],
  category: "rpg",
  description: { id: "Antar paket sebagai kurir, dapat upah per trip", en: "Deliver packages as a courier, paid per trip" },
  usage: ".kurir",
  example: ".kurir",
  cooldown: 5,
}

export const i18n = {
  id: { "kurir": {
    "jailed": "╭─❏ 🚔 「 *KURIR* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *KURIR* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *KURIR* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *KURIR* 」\n┊ Semua paket terkirim, upah kurir cair.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *KURIR* 」\n┊ Satu paket nyasar, upah trip ini hangus~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "kurir": {
    "jailed": "╭─❏ 🚔 「 *KURIR* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *KURIR* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *KURIR* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *KURIR* 」\n┊ All packages delivered, courier pay received.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *KURIR* 」\n┊ One package went missing, this trip's pay is gone~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".kurir", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('kurir.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_kurir) || 0
  const cdMs = 30 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('kurir.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 12) return ctx.reply(ctx.t('kurir.lowEnergy', { energy, need: 12 }))
  profile.energy = energy - 12
  profile.last_kurir = now
  if (Math.random() < 0.1) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('kurir.failed', { energy: profile.energy }))
  }
  const coins = 90 + Math.floor(Math.random() * (100)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 10)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('kurir.done', { coins, xp: 10, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
