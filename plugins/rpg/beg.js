// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "beg",
  alias: [],
  category: "rpg",
  description: { id: "Mengemis: dapat sedikit koin, sering ditolak", en: "Begging: a few coins, often refused" },
  usage: ".beg",
  example: ".beg",
  cooldown: 5,
}

export const i18n = {
  id: { "beg": {
    "jailed": "╭─❏ 🚔 「 *BEG* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BEG* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BEG* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *BEG* 」\n┊ Ada orang baik yang memberimu recehan.\n┊ UPAH: *+{coins} KOIN* | XP: *+{xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *BEG* 」\n┊ Tidak ada yang berhenti memberimu apa apa~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "beg": {
    "jailed": "╭─❏ 🚔 「 *BEG* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BEG* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BEG* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *BEG* 」\n┊ A kind person gave you some change.\n┊ PAY: *+{coins} COINS* | XP: *+{xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *BEG* 」\n┊ Nobody stopped to give you anything~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".beg", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('beg.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_beg) || 0
  const cdMs = 60 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('beg.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 5) return ctx.reply(ctx.t('beg.lowEnergy', { energy, need: 5 }))
  profile.energy = energy - 5
  profile.last_beg = now
  if (Math.random() < 0.4) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('beg.failed', { energy: profile.energy }))
  }
  const coins = 10 + Math.floor(Math.random() * (50)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 3)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('beg.done', { coins, xp: 3, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
