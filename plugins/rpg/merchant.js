// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// membalas ringkasan generik. Sekarang merchant adalah pedagang keliling
// nyata: dia MEMBELI barang dari tasmu 10 persen di atas harga jual biasa
// (.merchant <item> [jumlah]); tanpa argumen dia menampilkan daftar barang
// yang dia beli beserta harga merchantnya dari tasmu.
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { ITEM_MAP, JOB_MAP } from '../../src/rpg/data.js'

export const MERCHANT_BONUS = 10

export const config = {
  name: 'merchant',
  alias: [],
  category: 'rpg',
  description: { id: 'Pedagang keliling: jual barang ke dia 10 persen lebih mahal dari harga biasa', en: 'Traveling merchant: sell items to him for 10 percent above the normal price' },
  usage: '.merchant <item> [jumlah]',
  example: '.merchant besi 2',
  cooldown: 5,
}

export const i18n = {
  id: {
    merchant: {
      list: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ Pedagang keliling membeli 10% lebih mahal. Barangmu yang dia mau:\n┊ {list}\n┊ Jual pakai .merchant <item> [jumlah]\n╰━━━━━━━',
      empty: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ Tasmu kosong, pedagang keliling tidak bisa beli apa apa. Kumpulkan barang dulu yaa~\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      done: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ Terjual ke merchant: *{qty}x {item}* seharga *+{gain} koin* (harga merchant @{unit})\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      noItem: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ Kamu tidak punya *{item}* sebanyak itu di tas. Punya kamu: *{have}*\n╰━━━━━━━',
      unknown: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ Item *{id}* tidak dikenal pedagang. Cek .inventory buat id barangmu\n╰━━━━━━━',
    },
  },
  en: {
    merchant: {
      list: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ The traveling merchant buys 10% above normal. Your items he wants:\n┊ {list}\n┊ Sell with .merchant <item> [qty]\n╰━━━━━━━',
      empty: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ Your bag is empty, the traveling merchant cannot buy anything. Gather items first~\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      done: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ Sold to merchant: *{qty}x {item}* for *+{gain} coins* (merchant price @{unit})\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      noItem: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ You do not have that many *{item}* in your bag. You have: *{have}*\n╰━━━━━━━',
      unknown: '╭─❏ 🧳 「 *MERCHANT* 」\n┊ The merchant does not know item *{id}*. Check .inventory for your item ids\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.merchant besi 1', expect: /terjual ke merchant|tidak punya|sold to merchant|do not have|tidak dikenal|does not know/i }

export function merchantUnitPrice(itemId, profile) {
  const item = ITEM_MAP[itemId]
  if (!item) return 0
  let unit = Math.floor(item.price * (1 + MERCHANT_BONUS / 100))
  const job = JOB_MAP[profile?.job]
  if (job && job.bonus.activity === 'sell') unit = Math.floor(unit * (1 + job.bonus.percent / 100))
  return unit
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inv = profile.inventory ?? {}
  const [rawId, rawQty] = (ctx.text || '').trim().toLowerCase().split(/\s+/)
  if (!rawId) {
    const rows = Object.entries(inv).filter(([, q]) => q > 0)
    if (!rows.length) return ctx.reply(ctx.t('merchant.empty', { balance: profile.balance ?? 0 }))
    const list = rows.map(([id, q]) => {
      const def = ITEM_MAP[id]
      const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : id
      return (def?.emoji ?? '•') + ' ' + nm + ' x' + q + ' (@' + merchantUnitPrice(id, profile) + ')'
    }).join('\n┊ ')
    return ctx.reply(ctx.t('merchant.list', { list }))
  }
  const item = ITEM_MAP[rawId]
  if (!item) return ctx.reply(ctx.t('merchant.unknown', { id: rawId }))
  const qty = Math.max(1, Math.floor(Number(rawQty) || 1))
  const have = inv[rawId] ?? 0
  const nm = ctx.lang === 'en' ? item.name.en : item.name.id
  if (have < qty) return ctx.reply(ctx.t('merchant.noItem', { item: nm, have }))
  const unit = merchantUnitPrice(rawId, profile)
  const gain = unit * qty
  const nextInv = { ...inv }
  nextInv[rawId] = have - qty
  if (nextInv[rawId] <= 0) delete nextInv[rawId]
  const balance = (profile.balance ?? 0) + gain
  await updateProfile(ctx.storage, ctx.senderDigits, { inventory: nextInv, balance })
  return ctx.reply(ctx.t('merchant.done', { qty, item: nm, gain, unit, balance }))
}
