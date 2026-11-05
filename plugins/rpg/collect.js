// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "collect",
  alias: [],
  category: "rpg",
  description: { id: "Mengumpulkan hasil alam ringan lewat mesin gather", en: "Light nature collecting via the gather engine" },
  usage: ".collect",
  example: ".collect",
  cooldown: 5,
}

export const i18n = {
  id: { "collect": {
    "jailed": "╭─❏ 🚔 「 *COLLECT* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *COLLECT* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *COLLECT* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *COLLECT* 」\n┊ Kumpulan barang alamimu sudah terkantongi.\n┊ HASIL: *{items}*\n┊ KOIN TAMBAHAN: *+{coins}* | SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *COLLECT* 」\n┊ Tidak ada yang layak dikumpulkan kali ini~\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "collect": {
    "jailed": "╭─❏ 🚔 「 *COLLECT* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *COLLECT* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *COLLECT* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *COLLECT* 」\n┊ Your collected nature goods are bagged.\n┊ HAUL: *{items}*\n┊ BONUS COINS: *+{coins}* | BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *COLLECT* 」\n┊ Nothing worth collecting this time~\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".collect", expect: /hasil|haul|tidak ada yang layak|energi|istirahat/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('collect.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_collect) || 0
  if (now - last < 60000) return ctx.reply(ctx.t('collect.wait', { minutes: 1 }))
  const energy = energyOf(profile)
  if (energy < 5) return ctx.reply(ctx.t('collect.lowEnergy', { energy, need: 5 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 5, last_collect: now })
  const result = await gather(ctx.storage, ctx.senderDigits, 'farming')
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (result.failed) return ctx.reply(ctx.t('collect.failed', { balance: fresh.balance ?? 0 }))
  const list = result.items.map((it) => {
    const def = ITEM_MAP[it.id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : it.id
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + it.qty
  }).join(', ')
  return ctx.reply(ctx.t('collect.done', { items: list, coins: result.coins, balance: fresh.balance ?? 0 }))
}
