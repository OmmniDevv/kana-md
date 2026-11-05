// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "streamer",
  alias: [],
  category: "rpg",
  description: { id: "Live streaming: pendapatan donasi sangat acak", en: "Live streaming: donation income is very random" },
  usage: ".streamer",
  example: ".streamer",
  cooldown: 5,
}

export const i18n = {
  id: { "streamer": {
    "jailed": "╭─❏ 🚔 「 *STREAMER* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *STREAMER* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *STREAMER* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *STREAMER* 」\n┊ Live kamu ramai, donasi masuk deras.\n┊ UPAH: *+{coins} KOIN* | XP: *+{xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *STREAMER* 」\n┊ Live sepi penonton, tidak ada donasi~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "streamer": {
    "jailed": "╭─❏ 🚔 「 *STREAMER* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *STREAMER* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *STREAMER* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *STREAMER* 」\n┊ Your stream was lively, donations poured in.\n┊ PAY: *+{coins} COINS* | XP: *+{xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *STREAMER* 」\n┊ The stream was empty, no donations~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".streamer", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('streamer.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_streamer) || 0
  const cdMs = 60 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('streamer.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 8) return ctx.reply(ctx.t('streamer.lowEnergy', { energy, need: 8 }))
  profile.energy = energy - 8
  profile.last_streamer = now
  if (Math.random() < 0.3) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('streamer.failed', { energy: profile.energy }))
  }
  const coins = 60 + Math.floor(Math.random() * (240)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 12)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('streamer.done', { coins, xp: 12, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
