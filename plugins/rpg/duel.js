import { sendButtons } from '../../src/ui/buttons.js'
import { duel } from '../../src/rpg/engine.js'

export const config = {
  name: 'duel',
  alias: [],
  category: 'rpg',
  description: { id: 'Duel RPG lawan pemain lain, pemenang merebut sampai 100 koin', en: 'RPG duel against another player, winner takes up to 100 coins' },
  usage: '.duel @tag | .duel <nomor>',
  example: '.duel 6281234567890',
  cooldown: 10,
}

export const i18n = {
  id: {
    duel: {
      noTarget: 'Mau duel lawan siapa nih? Tag orangnya atau ketik nomornya, contoh .duel @teman yaa~',
      self: 'Ehh, masa duel lawan diri sendiri... KANA nggak tega liatnya 🥺',
      result: '⚔️ HASIL DUEL ⚔️\nKamu (power {powerA}) vs lawan (power {powerB})\n{verdict}\nKoin berpindah: {coins} 💰\n{mood}',
      win: '🎉 Kamu menang! Kerja bagus, jagoan KANA~',
      lose: 'Mouu, kamu kalah kali ini... latih power di .dungeon dulu yaa 🥺',
      btnDungeon: 'Dungeon',
      btnProfile: 'Profil RPG',
      btnMenu: 'Menu RPG',
    },
  },
  en: {
    duel: {
      noTarget: 'Who do you want to duel? Tag them or type their number, e.g. .duel @friend~',
      self: 'Eh, dueling yourself... KANA cannot watch that 🥺',
      result: '⚔️ DUEL RESULT ⚔️\nYou (power {powerA}) vs opponent (power {powerB})\n{verdict}\nCoins moved: {coins} 💰\n{mood}',
      win: '🎉 You won! Great job, my champion~',
      lose: 'Mouu, you lost this time... raise your power in .dungeon first 🥺',
      btnDungeon: 'Dungeon',
      btnProfile: 'RPG Profile',
      btnMenu: 'RPG Menu',
    },
  },
}

export const test = { input: '.duel', expect: /duel/i }

export async function handler(ctx) {
  const replies = [
    { text: ctx.t('duel.btnDungeon'), id: '.dungeon' },
    { text: ctx.t('duel.btnProfile'), id: '.rpg' },
    { text: ctx.t('duel.btnMenu'), id: '.menurpg' },
  ]
  const send = (body) =>
    sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  let target = ''
  if (ctx.mentionedJids?.length) target = String(ctx.mentionedJids[0]).split('@')[0].replace(/\D/g, '')
  if (!target && ctx.quoted?.sender) {
    target = String(ctx.quoted.sender).split('@')[0].replace(/\D/g, '')
  }
  if (!target) target = String(ctx.args?.[0] ?? '').replace(/\D/g, '')
  if (!target) return send(ctx.t('duel.noTarget'))
  if (target === ctx.senderDigits) return send(ctx.t('duel.self'))
  const res = await duel(ctx.storage, ctx.senderDigits, target)
  const won = res.winner === ctx.senderDigits
  const body = ctx.t('duel.result', {
    powerA: res.powerA,
    powerB: res.powerB,
    verdict: won ? ctx.t('duel.win') : ctx.t('duel.lose'),
    coins: res.coins,
    mood: won ? ctx.say('senang') : ctx.say('gagal'),
  })
  return send(body)
}
