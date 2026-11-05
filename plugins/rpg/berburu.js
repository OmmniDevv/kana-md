// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin duel
// angka taruhan generik. Sekarang berburu sungguhan memakai gather engine
// tabel hunting (daging, kulit, tanduk) dengan gerbang energi dan penjara,
// sama seperti aktivitas gather gelombang 1. Alias .hunter di sini.
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { gather } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'

export const config = {
  name: 'berburu',
  alias: ['hunter'],
  category: 'rpg',
  description: { id: 'Berburu di hutan pakai gather engine: dapat daging, kulit, tanduk (alias .hunter)', en: 'Hunt in the forest with the gather engine: meat, leather, horns (alias .hunter)' },
  usage: '.berburu',
  example: '.berburu',
  cooldown: 5,
}

export const ENERGY_COST = 10

export const i18n = {
  id: {
    berburu: {
      jailed: '╭─❏ 🚔 「 *BERBURU* 」\n┊ Kamu masih di penjara, *{minutes} menit* lagi. Berburu ditahan dulu~\n╰━━━━━━━',
      lowEnergy: '╭─❏ 🔋 「 *BERBURU* 」\n┊ Energimu *{energy}*, butuh *{need}* buat berburu. Makan (.eat) atau istirahat (.istirahat) dulu~\n╰━━━━━━━',
      done: '╭─❏ 🏹 「 *BERBURU* 」\n┊ Hasil buruan: *{items}*\n┊ Bonus koin: *+{coins}* | Saldo: *{balance} koin* | Energi sisa: *{energy}*\n╰━━━━━━━',
      failed: '╭─❏ 🏹 「 *BERBURU* 」\n┊ Buruannya kabur, tangan kosong kali ini. Saldo: *{balance} koin* | Energi sisa: *{energy}*\n╰━━━━━━━',
    },
  },
  en: {
    berburu: {
      jailed: '╭─❏ 🚔 「 *BERBURU* 」\n┊ You are still jailed, *{minutes} minutes* left. Hunting is on hold~\n╰━━━━━━━',
      lowEnergy: '╭─❏ 🔋 「 *BERBURU* 」\n┊ Your energy is *{energy}*, hunting needs *{need}*. Eat (.eat) or rest (.istirahat) first~\n╰━━━━━━━',
      done: '╭─❏ 🏹 「 *BERBURU* 」\n┊ Your catch: *{items}*\n┊ Bonus coins: *+{coins}* | Balance: *{balance} coins* | Energy left: *{energy}*\n╰━━━━━━━',
      failed: '╭─❏ 🏹 「 *BERBURU* 」\n┊ The prey escaped, empty handed this time. Balance: *{balance} coins* | Energy left: *{energy}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.berburu', expect: /hasil buruan|buruannya kabur|energimu|your catch|prey escaped|your energy/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('berburu.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < ENERGY_COST) return ctx.reply(ctx.t('berburu.lowEnergy', { energy, need: ENERGY_COST }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - ENERGY_COST })
  const result = await gather(ctx.storage, ctx.senderDigits, 'hunting')
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (result.failed) {
    return ctx.reply(ctx.t('berburu.failed', { balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
  }
  const list = result.items.map((it) => {
    const def = ITEM_MAP[it.id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : it.id
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + it.qty
  }).join(', ')
  return ctx.reply(ctx.t('berburu.done', { items: list, coins: result.coins, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
