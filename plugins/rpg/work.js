// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "work",
  alias: [],
  category: "rpg",
  description: { id: "Kerja serabutan: dapat upah koin dan XP, makan energi, ada cooldown", en: "Odd jobs: earn coins and XP, costs energy, has a cooldown" },
  usage: ".work",
  example: ".work",
  cooldown: 5,
}

export const i18n = {
  id: { "work": {
    "jailed": "╭─❏ 🚔 「 *WORK* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *WORK* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *WORK* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *WORK* 」\n┊ Kamu menyelesaikan pekerjaan serabutan hari ini.\n┊ UPAH: *+{coins} KOIN* | XP: *+{xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *WORK* 」\n┊ Pekerjaanmu berantakan di tengah jalan, tidak ada upah kali ini~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "work": {
    "jailed": "╭─❏ 🚔 「 *WORK* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *WORK* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *WORK* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *WORK* 」\n┊ You finished today's odd jobs.\n┊ PAY: *+{coins} COINS* | XP: *+{xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *WORK* 」\n┊ Your work fell apart midway, no pay this time~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".work", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('work.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_work) || 0
  const cdMs = 30 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('work.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 10) return ctx.reply(ctx.t('work.lowEnergy', { energy, need: 10 }))
  profile.energy = energy - 10
  profile.last_work = now
  if (Math.random() < 0.1) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('work.failed', { energy: profile.energy }))
  }
  const coins = 80 + Math.floor(Math.random() * (100)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 10)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('work.done', { coins, xp: 10, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
