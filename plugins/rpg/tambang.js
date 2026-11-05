// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "tambang",
  alias: [],
  category: "rpg",
  description: { id: "Menambang sungguhan lewat mesin gather: batu, besi, emas masuk inventaris", en: "Real mining via the gather engine: stone, iron, gold go to your inventory" },
  usage: ".tambang",
  example: ".tambang",
  cooldown: 5,
}

export const i18n = {
  id: { "tambang": {
    "jailed": "╭─❏ 🚔 「 *TAMBANG* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TAMBANG* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TAMBANG* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *TAMBANG* 」\n┊ Kamu keluar dari tambang membawa hasil.\n┊ HASIL: *{items}*\n┊ KOIN TAMBAHAN: *+{coins}* | SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *TAMBANG* 」\n┊ Lorongnya kosong, tidak ada yang bisa dibawa pulang~\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "tambang": {
    "jailed": "╭─❏ 🚔 「 *TAMBANG* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TAMBANG* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TAMBANG* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🎒 「 *TAMBANG* 」\n┊ You came out of the mine carrying the haul.\n┊ HAUL: *{items}*\n┊ BONUS COINS: *+{coins}* | BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "failed": "╭─❏ 🕸️ 「 *TAMBANG* 」\n┊ The tunnel was empty, nothing to bring home~\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".tambang", expect: /hasil|haul|lorongnya kosong|energi|istirahat/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('tambang.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_tambang) || 0
  if (now - last < 60000) return ctx.reply(ctx.t('tambang.wait', { minutes: 1 }))
  const energy = energyOf(profile)
  if (energy < 15) return ctx.reply(ctx.t('tambang.lowEnergy', { energy, need: 15 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 15, last_tambang: now })
  const result = await gather(ctx.storage, ctx.senderDigits, 'mining')
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (result.failed) return ctx.reply(ctx.t('tambang.failed', { balance: fresh.balance ?? 0 }))
  const list = result.items.map((it) => {
    const def = ITEM_MAP[it.id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : it.id
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + it.qty
  }).join(', ')
  return ctx.reply(ctx.t('tambang.done', { items: list, coins: result.coins, balance: fresh.balance ?? 0 }))
}
