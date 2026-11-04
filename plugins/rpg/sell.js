import { sellItem } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'sell',
  alias: ['jual'],
  category: 'rpg',
  description: { id: 'Jual item dari tas kamu jadi koin', en: 'Sell items from your bag into coins' },
  usage: '.sell <id item> [jumlah]',
  example: '.sell besi 2',
  cooldown: 3,
}

export const i18n = {
  id: {
    sell: {
      hint: '╭─❏ ✨ 「 *SELL* 」\n┊ Tulis id itemnya yaa~ Contoh: .sell besi 2. Lihat tasmu dengan .inventory\n╰━━━━━━━',
      done: '╭─❏ 💰 「 *SELL* 」\n┊ 💰 Terjual {qty}x {item} seharga *{coins} koin*. Saldo sekarang {balance} koin {mood}\n╰━━━━━━━',
      fail: '╭─❏ ✨ 「 *SELL* 」\n┊ Gagal menjual: {error}. Pastikan id item dan jumlahnya benar yaa~\n╰━━━━━━━',
    },
  },
  en: {
    sell: {
      hint: '╭─❏ ✨ 「 *SELL* 」\n┊ Write the item id please~ Example: .sell besi 2. See your bag with .inventory\n╰━━━━━━━',
      done: '╭─❏ 💰 「 *SELL* 」\n┊ 💰 Sold {qty}x {item} for *{coins} coins*. Balance now {balance} coins {mood}\n╰━━━━━━━',
      fail: '╭─❏ ✨ 「 *SELL* 」\n┊ Failed to sell: {error}. Make sure the item id and quantity are right~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.sell', expect: /item/i }

export async function handler(ctx) {
  const [itemId, qtyRaw] = (ctx.text || '').trim().toLowerCase().split(/\s+/)
  if (!itemId) return ctx.reply(ctx.t('sell.hint'))
  const qty = Math.max(1, parseInt(qtyRaw, 10) || 1)
  try {
    const result = await sellItem(ctx.storage, ctx.senderDigits, itemId, qty)
    if (!result?.ok) return ctx.reply(ctx.t('sell.fail', { error: result?.reason ?? 'unknown' }))
    const item = ITEM_MAP[itemId]
    const name = item ? (ctx.lang === 'en' ? item.name.en : item.name.id) : itemId
    return ctx.reply(ctx.t('sell.done', {
      qty, item: name, coins: result.gain ?? 0,
      balance: result.balance ?? 0, mood: ctx.say('sukses'),
    }))
  } catch (err) {
    return ctx.reply(ctx.t('sell.fail', { error: err.message }))
  }
}
