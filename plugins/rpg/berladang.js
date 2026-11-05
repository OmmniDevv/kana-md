// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "berladang",
  alias: [],
  category: "rpg",
  description: { id: "Berladang lewat mesin gather: padi dan hasil ladang masuk inventaris", en: "Field farming via the gather engine: rice and field goods go to your inventory" },
  usage: ".berladang",
  example: ".berladang",
  cooldown: 5,
}

export const i18n = {
  id: { "berladang": {
    "jailed": "╭─❏ 🚔 「 *BERLADANG* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BERLADANG* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERLADANG* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *BERLADANG* 」\n┊ Hasil ladangmu terkumpul bagus hari ini.\n┊ HASIL: *{items}*\n┊ KOIN TAMBAHAN: *+{coins}* | SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *BERLADANG* 」\n┊ Ladangmu diserang hama, panen gagal~\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "berladang": {
    "jailed": "╭─❏ 🚔 「 *BERLADANG* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BERLADANG* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERLADANG* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *BERLADANG* 」\n┊ Your field yield gathered nicely today.\n┊ HAUL: *{items}*\n┊ BONUS COINS: *+{coins}* | BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *BERLADANG* 」\n┊ Pests hit your field, the harvest failed~\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".berladang", expect: /hasil|haul|diserang hama|energi|istirahat/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('berladang.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_berladang) || 0
  if (now - last < 60000) return ctx.reply(ctx.t('berladang.wait', { minutes: 1 }))
  const energy = energyOf(profile)
  if (energy < 10) return ctx.reply(ctx.t('berladang.lowEnergy', { energy, need: 10 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 10, last_berladang: now })
  const result = await gather(ctx.storage, ctx.senderDigits, 'farming')
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (result.failed) return ctx.reply(ctx.t('berladang.failed', { balance: fresh.balance ?? 0 }))
  const list = result.items.map((it) => {
    const def = ITEM_MAP[it.id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : it.id
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + it.qty
  }).join(', ')
  return ctx.reply(ctx.t('berladang.done', { items: list, coins: result.coins, balance: fresh.balance ?? 0 }))
}
