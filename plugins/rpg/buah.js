// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// hanya membalas ringkasan saldo + flavor. Sekarang menampilkan data nyata
// spesifik namanya dari inventaris profil (item data.js + harga jualnya).
import { getProfile } from '../../src/services/user-service.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'buah',
  alias: [],
  category: 'rpg',
  description: { id: 'Stok buah nyata dari inventarismu, lengkap dengan harga jualnya', en: 'Your real fruit stock from your inventory, with sell prices' },
  usage: '.buah',
  example: '.buah',
  cooldown: 5,
}

export const ITEMS_SHOWN = ["buah"]

export const i18n = {
  id: {
    buah: {
      empty: '╭─❏ 🍎 「 *BUAH* 」\n┊ Buahmu habis. Panen dari .berkebon atau .berladang dulu yaa~\n╰━━━━━━━',
      list: '╭─❏ 🍎 「 *BUAH* 」\n┊ {list}\n┊ Total nilai jual: *{total} koin* (jual pakai .sellall)\n╰━━━━━━━',
    },
  },
  en: {
    buah: {
      empty: '╭─❏ 🍎 「 *FRUIT* 」\n┊ You have no fruit. Harvest from .berkebon or .berladang first~\n╰━━━━━━━',
      list: '╭─❏ 🍎 「 *FRUIT* 」\n┊ {list}\n┊ Total sell value: *{total} coins* (sell with .sellall)\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.buah', expect: /buahmu habis|total nilai jual|no fruit|total sell value/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inv = profile.inventory ?? {}
  const rows = ITEMS_SHOWN.filter((id) => (inv[id] ?? 0) > 0)
  if (!rows.length) return ctx.reply(ctx.t('buah.empty'))
  let total = 0
  const list = rows.map((id) => {
    const def = ITEM_MAP[id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : id
    const price = def?.price ?? 0
    total += price * inv[id]
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + inv[id] + ' (@' + price + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('buah.list', { list, total }))
}
