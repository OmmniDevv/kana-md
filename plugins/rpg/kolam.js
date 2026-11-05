// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// hanya membalas ringkasan saldo + flavor. Sekarang menampilkan data nyata
// spesifik namanya dari inventaris profil (item data.js + harga jualnya).
import { getProfile } from '../../src/services/user-service.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'kolam',
  alias: [],
  category: 'rpg',
  description: { id: 'Isi kolam nyata: hasil pancinganmu dari inventaris, lengkap harga jualnya', en: 'Real pond contents: your catches from your inventory, with sell prices' },
  usage: '.kolam',
  example: '.kolam',
  cooldown: 5,
}

export const ITEMS_SHOWN = ["ikan", "ikanmas", "udang", "kepiting", "ikanlegendaris"]

export const i18n = {
  id: {
    kolam: {
      empty: '╭─❏ 🎣 「 *KOLAM* 」\n┊ Kolammu kosong, belum ada hasil pancingan. Mancing dulu pakai .mancing~\n╰━━━━━━━',
      list: '╭─❏ 🎣 「 *KOLAM* 」\n┊ {list}\n┊ Total nilai jual: *{total} koin* (jual pakai .sellall)\n╰━━━━━━━',
    },
  },
  en: {
    kolam: {
      empty: '╭─❏ 🎣 「 *POND* 」\n┊ Your pond is empty, no catches yet. Go fishing with .mancing~\n╰━━━━━━━',
      list: '╭─❏ 🎣 「 *POND* 」\n┊ {list}\n┊ Total sell value: *{total} coins* (sell with .sellall)\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.kolam', expect: /kolammu kosong|total nilai jual|pond is empty|total sell value/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inv = profile.inventory ?? {}
  const rows = ITEMS_SHOWN.filter((id) => (inv[id] ?? 0) > 0)
  if (!rows.length) return ctx.reply(ctx.t('kolam.empty'))
  let total = 0
  const list = rows.map((id) => {
    const def = ITEM_MAP[id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : id
    const price = def?.price ?? 0
    total += price * inv[id]
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + inv[id] + ' (@' + price + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('kolam.list', { list, total }))
}
