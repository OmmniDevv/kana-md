// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="spend"
// malah MENGURANGI saldo. Sekarang menjual SEMUA isi inventaris dengan
// harga data.js lewat sellItem (termasuk bonus job pedagang), jadi saldo
// BERTAMBAH dan inventaris kosong. Kanonis untuk .jualan (alias).
import { getProfile } from '../../src/services/user-service.js'
import { sellItem } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'sellall',
  alias: ['jualan'],
  category: 'rpg',
  description: { id: 'Jual semua isi tasmu sekaligus: saldo bertambah sesuai harga barang', en: 'Sell everything in your bag at once: balance grows by the item prices' },
  usage: '.sellall',
  example: '.sellall',
  cooldown: 5,
}

export const i18n = {
  id: {
    sellall: {
      empty: '╭─❏ 🎒 「 *SELLALL* 」\n┊ Tasmu kosong, tidak ada yang bisa dijual. Kumpulkan dulu dari .tambang atau .mancing\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      done: '╭─❏ 💰 「 *SELLALL* 」\n┊ Semua barang terjual: {list}\n┊ Total dapat: *+{gain} koin*\n┊ Saldo sekarang: *{balance} koin*\n╰━━━━━━━',
    },
  },
  en: {
    sellall: {
      empty: '╭─❏ 🎒 「 *SELLALL* 」\n┊ Your bag is empty, nothing to sell. Gather first from .tambang or .mancing\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      done: '╭─❏ 💰 「 *SELLALL* 」\n┊ Everything sold: {list}\n┊ Total gained: *+{gain} coins*\n┊ Balance now: *{balance} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.sellall', expect: /terjual|everything sold|tasmu kosong|bag is empty/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const entries = Object.entries(profile.inventory ?? {}).filter(([, q]) => q > 0)
  if (!entries.length) return ctx.reply(ctx.t('sellall.empty', { balance: profile.balance ?? 0 }))
  let gain = 0
  let balance = profile.balance ?? 0
  const parts = []
  for (const [id, qty] of entries) {
    const res = await sellItem(ctx.storage, ctx.senderDigits, id, qty)
    if (res.ok) {
      gain += res.gain
      balance = res.balance
      const def = ITEM_MAP[id]
      const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : id
      parts.push(nm + ' x' + qty)
    }
  }
  return ctx.reply(ctx.t('sellall.done', { list: parts.join(', '), gain, balance }))
}
