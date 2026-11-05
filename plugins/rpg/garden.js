// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// hanya membalas ringkasan saldo + flavor. Sekarang menampilkan data nyata
// spesifik namanya dari inventaris profil (item data.js + harga jualnya).
import { getProfile } from '../../src/services/user-service.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'garden',
  alias: [],
  category: 'rpg',
  description: { id: 'Isi kebun nyata: hasil tani (padi, sayur, buah, bunga) dari inventarismu', en: 'Real garden contents: farm produce (rice, vegetables, fruit, flowers) from your inventory' },
  usage: '.garden',
  example: '.garden',
  cooldown: 5,
}

export const ITEMS_SHOWN = ["padi", "sayur", "buah", "bunga"]

export const i18n = {
  id: {
    garden: {
      empty: '╭─❏ 🌻 「 *KEBUN* 」\n┊ Kebunmu masih kosong. Tanam dan panen pakai .berkebon atau .berladang~\n╰━━━━━━━',
      list: '╭─❏ 🌻 「 *KEBUN* 」\n┊ {list}\n┊ Total nilai jual: *{total} koin* (jual pakai .sellall)\n╰━━━━━━━',
    },
  },
  en: {
    garden: {
      empty: '╭─❏ 🌻 「 *GARDEN* 」\n┊ Your garden is still empty. Plant and harvest with .berkebon or .berladang~\n╰━━━━━━━',
      list: '╭─❏ 🌻 「 *GARDEN* 」\n┊ {list}\n┊ Total sell value: *{total} coins* (sell with .sellall)\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.garden', expect: /kebunmu masih kosong|total nilai jual|garden is still empty|total sell value/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inv = profile.inventory ?? {}
  const rows = ITEMS_SHOWN.filter((id) => (inv[id] ?? 0) > 0)
  if (!rows.length) return ctx.reply(ctx.t('garden.empty'))
  let total = 0
  const list = rows.map((id) => {
    const def = ITEM_MAP[id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : id
    const price = def?.price ?? 0
    total += price * inv[id]
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + inv[id] + ' (@' + price + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('garden.list', { list, total }))
}
