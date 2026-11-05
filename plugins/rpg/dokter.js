// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "dokter",
  alias: [],
  category: "rpg",
  description: { id: "Berobat ke dokter: 200 koin untuk energi penuh seketika", en: "See the doctor: 200 coins for instant full energy" },
  usage: ".dokter",
  example: ".dokter",
  cooldown: 5,
}

export const i18n = {
  id: { "dokter": {
    "healthy": "╭─❏ 🩺 「 *DOKTER* 」\n┊ Kamu sehat walafiat, energi penuh. Tidak perlu berobat~\n╰━━━━━━━",
    "poor": "╭─❏ 🩺 「 *DOKTER* 」\n┊ Biaya dokter 200 koin, saldomu *{balance} KOIN*. Kurang~\n╰━━━━━━━",
    "done": "╭─❏ 🩺 「 *DOKTER* 」\n┊ SELESAI BEROBAT! Energi pulih penuh (100).\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "dokter": {
    "healthy": "╭─❏ 🩺 「 *DOCTOR* 」\n┊ You are perfectly healthy, energy full. No treatment needed~\n╰━━━━━━━",
    "poor": "╭─❏ 🩺 「 *DOCTOR* 」\n┊ The doctor costs 200 coins, your balance is *{balance} COINS*. Not enough~\n╰━━━━━━━",
    "done": "╭─❏ 🩺 「 *DOCTOR* 」\n┊ TREATMENT DONE! Energy fully restored (100).\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".dokter", expect: /berobat|treatment|sehat|healthy|dokter/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy >= 100) return ctx.reply(ctx.t('dokter.healthy'))
  const cost = 200
  if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('dokter.poor', { balance: profile.balance ?? 0 }))
  profile.balance = (profile.balance ?? 0) - cost
  profile.energy = 100
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('dokter.done', { balance: profile.balance }))
}
