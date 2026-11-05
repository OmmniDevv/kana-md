// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// hanya membalas ringkasan saldo + flavor. Sekarang menampilkan data nyata
// spesifik namanya dari inventaris profil (item data.js + harga jualnya).
import { getProfile } from '../../src/services/user-service.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'kulkas',
  alias: [],
  category: 'rpg',
  description: { id: 'Isi kulkas nyata: bahan makanan dan makanan jadi dari inventarismu', en: 'Real fridge contents: ingredients and cooked food from your inventory' },
  usage: '.kulkas',
  example: '.kulkas',
  cooldown: 5,
}

export const ITEMS_SHOWN = ["daging", "ikan", "ikanmas", "udang", "kepiting", "buah", "kue"]

export const i18n = {
  id: {
    kulkas: {
      empty: '╭─❏ 🧊 「 *KULKAS* 」\n┊ Kulkasmu kosong. Isi dari hasil buruan, pancingan, atau masak pakai .cook~\n╰━━━━━━━',
      list: '╭─❏ 🧊 「 *KULKAS* 」\n┊ {list}\n┊ Total nilai jual: *{total} koin* (jual pakai .sellall)\n╰━━━━━━━',
    },
  },
  en: {
    kulkas: {
      empty: '╭─❏ 🧊 「 *FRIDGE* 」\n┊ Your fridge is empty. Fill it from hunts, catches, or cook with .cook~\n╰━━━━━━━',
      list: '╭─❏ 🧊 「 *FRIDGE* 」\n┊ {list}\n┊ Total sell value: *{total} coins* (sell with .sellall)\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.kulkas', expect: /kulkasmu kosong|total nilai jual|fridge is empty|total sell value/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inv = profile.inventory ?? {}
  const rows = ITEMS_SHOWN.filter((id) => (inv[id] ?? 0) > 0)
  if (!rows.length) return ctx.reply(ctx.t('kulkas.empty'))
  let total = 0
  const list = rows.map((id) => {
    const def = ITEM_MAP[id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : id
    const price = def?.price ?? 0
    total += price * inv[id]
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + inv[id] + ' (@' + price + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('kulkas.list', { list, total }))
}
