import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { restoreEnergy, energyOf } from '../../src/rpg/energy.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'use',
  alias: ['pakai'],
  category: 'rpg',
  description: { id: 'Pakai item konsumsi dari tas, saat ini ramuan untuk energi', en: 'Use a consumable item from your bag, currently potions for energy' },
  usage: '.use <id item>',
  example: '.use ramuan',
  cooldown: 3,
}

export const CONSUMABLES = { ramuan: { energy: 50 } }

export const i18n = {
  id: {
    use: {
      hint: '╭─❏ ✨ 「 *USE* 」\n┊ Tulis item konsumsinya yaa~ Saat ini yang bisa dipakai: ramuan (+50 energi). Contoh: .use ramuan\n╰━━━━━━━',
      done: '╭─❏ 🧪 「 *USE* 」\n┊ 🧪 Kamu memakai {item}. Energi sekarang {energy}/100 {mood}\n╰━━━━━━━',
      none: '╭─❏ ✨ 「 *USE* 」\n┊ Kamu tidak punya {item} di tas. Beli dulu di .shop yaa~ {mood}\n╰━━━━━━━',
      notUsable: '╭─❏ ✨ 「 *USE* 」\n┊ {item} bukan item konsumsi. Yang bisa dipakai: ramuan.\n╰━━━━━━━',
    },
  },
  en: {
    use: {
      hint: '╭─❏ ✨ 「 *USE* 」\n┊ Write the consumable item please~ Currently usable: ramuan (+50 energy). Example: .use ramuan\n╰━━━━━━━',
      done: '╭─❏ 🧪 「 *USE* 」\n┊ 🧪 You used {item}. Energy is now {energy}/100 {mood}\n╰━━━━━━━',
      none: '╭─❏ ✨ 「 *USE* 」\n┊ You have no {item} in your bag. Buy one at .shop first~ {mood}\n╰━━━━━━━',
      notUsable: '╭─❏ ✨ 「 *USE* 」\n┊ {item} is not a consumable. Usable ones: ramuan.\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.use potion', expect: /Kamu memakai|tidak punya|bukan item konsumsi|You used/ }

export async function handler(ctx) {
  const itemId = (ctx.text || '').trim().toLowerCase().split(/\s+/)[0]
  if (!itemId) return ctx.reply(ctx.t('use.hint'))
  const item = ITEM_MAP[itemId]
  const name = item ? (ctx.lang === 'en' ? item.name.en : item.name.id) : itemId
  const effect = CONSUMABLES[itemId]
  if (!effect) return ctx.reply(ctx.t('use.notUsable', { item: name }))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inventory = { ...(profile.inventory ?? {}) }
  if ((inventory[itemId] ?? 0) < 1) return ctx.reply(ctx.t('use.none', { item: name, mood: ctx.say('gagal') }))
  inventory[itemId] -= 1
  if (inventory[itemId] <= 0) delete inventory[itemId]
  await updateProfile(ctx.storage, ctx.senderDigits, { inventory })
  let energy = energyOf(profile)
  if (effect.energy) energy = await restoreEnergy(ctx.storage, ctx.senderDigits, effect.energy)
  return ctx.reply(ctx.t('use.done', { item: name, energy, mood: ctx.say('sukses') }))
}
