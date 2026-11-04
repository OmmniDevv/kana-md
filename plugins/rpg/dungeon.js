import { sendButtons } from '../../src/ui/buttons.js'
import { runDungeon } from '../../src/rpg/engine.js'
import { MONSTERS, ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'dungeon',
  alias: [],
  category: 'rpg',
  description: { id: 'Masuk dungeon: lawan 3 gelombang monster bertingkat', en: 'Enter the dungeon: fight 3 waves of escalating monsters' },
  usage: '.dungeon',
  example: '.dungeon',
  cooldown: 30,
}

export const i18n = {
  id: {
    dungeon: {
      body: '🏰 HASIL DUNGEON 🏰\nPower kamu: {power}\n\n{lines}\nGelombang dilewati: {cleared}/3\nTotal koin: {coins} 💰\n{verdict}\n{mood}',
      wave: 'Gelombang {n}: kalahkan {emoji} {name}! +{coins} koin{item}',
      waveItem: ' + {item}',
      failedFirst: 'Mouu, gelombang pertama aja udah berat... naikkan level dan beli alat di .shop dulu yaa 🥺',
      partial: 'Lumayan! Terus latih power kamu biar bisa sapu bersih~',
      full: '🎉 SAPU BERSIH! Kamu penakluk dungeon hari ini!',
      btnAgain: 'Dungeon Lagi',
      btnShop: 'Toko',
      btnInventory: 'Tas Aku',
    },
  },
  en: {
    dungeon: {
      body: '🏰 DUNGEON RESULT 🏰\nYour power: {power}\n\n{lines}\nWaves cleared: {cleared}/3\nTotal coins: {coins} 💰\n{verdict}\n{mood}',
      wave: 'Wave {n}: defeated {emoji} {name}! +{coins} coins{item}',
      waveItem: ' + {item}',
      failedFirst: 'Mouu, even the first wave was too hard... level up and buy gear in .shop first 🥺',
      partial: 'Not bad! Keep raising your power to clear them all~',
      full: '🎉 FULL CLEAR! You are the dungeon conqueror today!',
      btnAgain: 'Dungeon Again',
      btnShop: 'Shop',
      btnInventory: 'My Bag',
    },
  },
}

export async function handler(ctx) {
  const res = await runDungeon(ctx.storage, ctx.senderDigits)
  const byId = Object.fromEntries(MONSTERS.map((m) => [m.id, m]))
  const lines = res.rewards
    .map((r, i) => {
      const m = byId[r.monster]
      const item = r.item
        ? ctx.t('dungeon.waveItem', { item: ITEM_MAP[r.item] ? ITEM_MAP[r.item].name[ctx.lang] ?? ITEM_MAP[r.item].name.id : r.item })
        : ''
      return ctx.t('dungeon.wave', { n: i + 1, emoji: m?.emoji ?? '👾', name: m ? m.name[ctx.lang] ?? m.name.id : r.monster, coins: r.coins, item })
    })
    .join('\n')
  const verdict = res.cleared === 0 ? ctx.t('dungeon.failedFirst') : res.cleared === 3 ? ctx.t('dungeon.full') : ctx.t('dungeon.partial')
  const body = ctx.t('dungeon.body', {
    power: res.power,
    lines: lines || '-',
    cleared: res.cleared,
    coins: res.totalCoins,
    verdict,
    mood: res.cleared === 3 ? ctx.say('senang') : ctx.say('mikir'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('dungeon.btnAgain'), id: '.dungeon' },
      { text: ctx.t('dungeon.btnShop'), id: '.shop' },
      { text: ctx.t('dungeon.btnInventory'), id: '.inventory' },
    ],
    textFallback: body,
  })
}
