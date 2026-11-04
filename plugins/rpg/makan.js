import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { restoreEnergy, energyOf } from '../../src/rpg/energy.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'makan',
  alias: ['eat'],
  category: 'rpg',
  description: { id: 'Makan makanan dari tas untuk memulihkan energi', en: 'Eat food from your bag to restore energy' },
  usage: '.makan <id makanan>',
  example: '.makan daging',
  cooldown: 3,
}

export const FOODS = {
  ikan: 15, sayur: 15, ikanmas: 20, buah: 20, udang: 20, daging: 25, kepiting: 25, kue: 30,
}

export const i18n = {
  id: {
    makan: {
      hint: '╭─❏ ✨ 「 *MAKAN* 」\n┊ Tulis makanan dari tasmu yaa~ Yang bisa dimakan: ikan, ikanmas, udang, kepiting, daging, sayur, buah, kue. Contoh: .makan daging\n╰━━━━━━━',
      done: '╭─❏ 🍽️ 「 *MAKAN* 」\n┊ 🍽️ Kamu makan {item}, energi pulih jadi {energy}/100. Nyam~ {mood}\n╰━━━━━━━',
      none: '╭─❏ ✨ 「 *MAKAN* 」\n┊ Kamu tidak punya {item} di tas. Cari dulu lewat .fishing, .hunting, atau .farming yaa~ {mood}\n╰━━━━━━━',
      notFood: '╭─❏ ✨ 「 *MAKAN* 」\n┊ {item} tidak bisa dimakan. Yang bisa dimakan: ikan, ikanmas, udang, kepiting, daging, sayur, buah, kue.\n╰━━━━━━━',
    },
  },
  en: {
    makan: {
      hint: '╭─❏ ✨ 「 *MAKAN* 」\n┊ Write food from your bag please~ Edible: ikan, ikanmas, udang, kepiting, daging, sayur, buah, kue. Example: .makan daging\n╰━━━━━━━',
      done: '╭─❏ 🍽️ 「 *MAKAN* 」\n┊ 🍽️ You ate {item}, energy restored to {energy}/100. Yum~ {mood}\n╰━━━━━━━',
      none: '╭─❏ ✨ 「 *MAKAN* 」\n┊ You have no {item} in your bag. Get some via .fishing, .hunting, or .farming first~ {mood}\n╰━━━━━━━',
      notFood: '╭─❏ ✨ 「 *MAKAN* 」\n┊ {item} is not edible. Edible ones: ikan, ikanmas, udang, kepiting, daging, sayur, buah, kue.\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.makan', expect: /makan|eat/i }

export async function handler(ctx) {
  const itemId = (ctx.text || '').trim().toLowerCase().split(/\s+/)[0]
  if (!itemId) return ctx.reply(ctx.t('makan.hint'))
  const item = ITEM_MAP[itemId]
  const name = item ? (ctx.lang === 'en' ? item.name.en : item.name.id) : itemId
  if (!FOODS[itemId]) return ctx.reply(ctx.t('makan.notFood', { item: name }))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inventory = { ...(profile.inventory ?? {}) }
  if ((inventory[itemId] ?? 0) < 1) return ctx.reply(ctx.t('makan.none', { item: name, mood: ctx.say('gagal') }))
  inventory[itemId] -= 1
  if (inventory[itemId] <= 0) delete inventory[itemId]
  await updateProfile(ctx.storage, ctx.senderDigits, { inventory })
  const energy = await restoreEnergy(ctx.storage, ctx.senderDigits, FOODS[itemId])
  return ctx.reply(ctx.t('makan.done', { item: name, energy: energy || energyOf(profile), mood: ctx.say('sukses') }))
}
