import { FALLBACK_POOL, RARITY_EMOJI } from '../rpg/gacha.js'

export const config = {
  name: 'liatgacha',
  alias: [],
  category: 'owner',
  description: { id: 'Melihat semua item yang tersedia di database gacha bot', en: 'View every item available in the bot gacha database' },
  usage: '.liatgacha',
  example: '.liatgacha',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    liatgacha: {
      header: '╭─❏ 🎁 「 *DATABASE GACHA* 」\n┊ Total *{count} item* di pool gacha:',
      group: '┊ {emoji} *{rarity}* ({count})',
      item: '┊   {emoji} {name}',
      footer: '╰━━━━━━━',
      empty: '╭─❏ 🎁 「 *DATABASE GACHA* 」\n┊ Pool gacha kosong, belum ada item terdaftar~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    liatgacha: {
      header: '╭─❏ 🎁 「 *GACHA DATABASE* 」\n┊ Total *{count} items* in the gacha pool:',
      group: '┊ {emoji} *{rarity}* ({count})',
      item: '┊   {emoji} {name}',
      footer: '╰━━━━━━━',
      empty: '╭─❏ 🎁 「 *GACHA DATABASE* 」\n┊ The gacha pool is empty, no items registered yet~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.liatgacha', expect: /gacha/i }

// Pool yang sama dengan yang dipakai .gacha: ITEMS dari src/rpg/data.js
// bila tersedia, kalau tidak pool bawaan plugins/rpg/gacha.js.
export async function loadGachaPool() {
  try {
    const mod = await import('../../src/rpg/data.js')
    const raw = mod.ITEMS ?? mod.items ?? mod.default?.ITEMS
    const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw) : null
    if (list && list.length) return list
  } catch {}
  return FALLBACK_POOL
}

function itemName(item, lang) {
  const name = item?.name
  if (typeof name === 'string') return name
  if (name && typeof name === 'object') return name[lang] || name.id || name.en || item.id || ''
  return item?.id || ''
}

export async function handler(ctx) {
  try {
    const pool = (await loadGachaPool()).filter((item) => item && (item.id || item.name))
    if (!pool.length) return ctx.reply(ctx.t('liatgacha.empty'))
    const groups = new Map()
    for (const item of pool) {
      const rarity = String(item.rarity || 'common').toLowerCase()
      if (!groups.has(rarity)) groups.set(rarity, [])
      groups.get(rarity).push(item)
    }
    const lines = [ctx.t('liatgacha.header', { count: pool.length })]
    for (const [rarity, items] of [...groups.entries()].sort()) {
      lines.push(ctx.t('liatgacha.group', { emoji: RARITY_EMOJI[rarity] ?? '⚪', rarity, count: items.length }))
      for (const item of items) {
        lines.push(ctx.t('liatgacha.item', { emoji: item.emoji || '🎁', name: itemName(item, ctx.lang) }))
      }
    }
    lines.push(ctx.t('liatgacha.footer'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('liatgacha.fail', { error: err.message }))
  }
}
