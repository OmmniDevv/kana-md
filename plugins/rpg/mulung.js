// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "mulung",
  alias: [],
  category: "rpg",
  description: { id: "Mulung barang bekas: koin kecil plus kadang barang temuan masuk inventaris", en: "Scavenging: small coins plus occasional found items for your inventory" },
  usage: ".mulung",
  example: ".mulung",
  cooldown: 5,
}

export const i18n = {
  id: { "mulung": {
    "jailed": "╭─❏ 🚔 「 *MULUNG* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *MULUNG* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *MULUNG* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *MULUNG* 」\n┊ Hasil mulungmu laku dijual ke pengepul.\n┊ UPAH: *+{coins} KOIN* | XP: *+{xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n┊ BARANG TEMUAN: *{item}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *MULUNG* 」\n┊ Rutenya sudah disapu pemulung lain~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "mulung": {
    "jailed": "╭─❏ 🚔 「 *MULUNG* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *MULUNG* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *MULUNG* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *MULUNG* 」\n┊ Your scavenged goods sold to the collector.\n┊ PAY: *+{coins} COINS* | XP: *+{xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n┊ FOUND ITEM: *{item}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *MULUNG* 」\n┊ The route was already swept by another scavenger~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".mulung", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('mulung.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_mulung) || 0
  const cdMs = 25 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('mulung.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 8) return ctx.reply(ctx.t('mulung.lowEnergy', { energy, need: 8 }))
  profile.energy = energy - 8
  profile.last_mulung = now
  if (Math.random() < 0.15) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('mulung.failed', { energy: profile.energy }))
  }
  const coins = 30 + Math.floor(Math.random() * (60)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  let itemLine = ''
  if (Math.random() < 0.5) {
    profile.inventory = profile.inventory ?? {}
    const pool = ['batu', 'tali', 'kayu', 'batubara']
    const got = pool[Math.floor(Math.random() * pool.length)]
    profile.inventory[got] = (profile.inventory[got] ?? 0) + 1
    itemLine = got
  }
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 6)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('mulung.done', { coins, xp: 6, balance: fresh.balance ?? 0, energy: energyOf(fresh), item: itemLine }))
}
