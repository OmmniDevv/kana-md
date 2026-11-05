// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "berkebon",
  alias: [],
  category: "rpg",
  description: { id: "Berkebun lewat mesin gather: sayur, buah, bunga masuk inventaris", en: "Gardening via the gather engine: vegetables, fruit, flowers go to your inventory" },
  usage: ".berkebon",
  example: ".berkebon",
  cooldown: 5,
}

export const i18n = {
  id: { "berkebon": {
    "jailed": "╭─❏ 🚔 「 *BERKEBON* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BERKEBON* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERKEBON* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *BERKEBON* 」\n┊ Panen kebunmu segar dan melimpah.\n┊ HASIL: *{items}*\n┊ KOIN TAMBAHAN: *+{coins}* | SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *BERKEBON* 」\n┊ Tanamanmu belum siap panen~\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "berkebon": {
    "jailed": "╭─❏ 🚔 「 *BERKEBON* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BERKEBON* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERKEBON* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *BERKEBON* 」\n┊ Your garden harvest is fresh and plenty.\n┊ HAUL: *{items}*\n┊ BONUS COINS: *+{coins}* | BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *BERKEBON* 」\n┊ Your plants are not ready to harvest~\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".berkebon", expect: /hasil|haul|belum siap panen|energi|istirahat/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('berkebon.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_berkebon) || 0
  if (now - last < 60000) return ctx.reply(ctx.t('berkebon.wait', { minutes: 1 }))
  const energy = energyOf(profile)
  if (energy < 10) return ctx.reply(ctx.t('berkebon.lowEnergy', { energy, need: 10 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 10, last_berkebon: now })
  const result = await gather(ctx.storage, ctx.senderDigits, 'farming')
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (result.failed) return ctx.reply(ctx.t('berkebon.failed', { balance: fresh.balance ?? 0 }))
  const list = result.items.map((it) => {
    const def = ITEM_MAP[it.id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : it.id
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + it.qty
  }).join(', ')
  return ctx.reply(ctx.t('berkebon.done', { items: list, coins: result.coins, balance: fresh.balance ?? 0 }))
}
