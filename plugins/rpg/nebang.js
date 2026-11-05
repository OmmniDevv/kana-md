// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "nebang",
  alias: [],
  category: "rpg",
  description: { id: "Menebang kayu lewat mesin gather: kayu dan hasil hutan masuk inventaris", en: "Woodcutting via the gather engine: wood and forest goods go to your inventory" },
  usage: ".nebang",
  example: ".nebang",
  cooldown: 5,
}

export const i18n = {
  id: { "nebang": {
    "jailed": "╭─❏ 🚔 「 *NEBANG* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NEBANG* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NEBANG* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *NEBANG* 」\n┊ Kayu hasil tebanganmu terikat rapi.\n┊ HASIL: *{items}*\n┊ KOIN TAMBAHAN: *+{coins}* | SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *NEBANG* 」\n┊ Pohonnya keras sekali, kapakmu mental terus~\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "nebang": {
    "jailed": "╭─❏ 🚔 「 *NEBANG* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NEBANG* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NEBANG* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *NEBANG* 」\n┊ Your cut wood is neatly bundled.\n┊ HAUL: *{items}*\n┊ BONUS COINS: *+{coins}* | BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *NEBANG* 」\n┊ The tree was too hard, your aXe kept bouncing off~\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".nebang", expect: /hasil|haul|kapakmu mental|energi|istirahat/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('nebang.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_nebang) || 0
  if (now - last < 60000) return ctx.reply(ctx.t('nebang.wait', { minutes: 1 }))
  const energy = energyOf(profile)
  if (energy < 12) return ctx.reply(ctx.t('nebang.lowEnergy', { energy, need: 12 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 12, last_nebang: now })
  const result = await gather(ctx.storage, ctx.senderDigits, 'farming')
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (result.failed) return ctx.reply(ctx.t('nebang.failed', { balance: fresh.balance ?? 0 }))
  const list = result.items.map((it) => {
    const def = ITEM_MAP[it.id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : it.id
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + it.qty
  }).join(', ')
  return ctx.reply(ctx.t('nebang.done', { items: list, coins: result.coins, balance: fresh.balance ?? 0 }))
}
