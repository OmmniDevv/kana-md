import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { consumeEnergy } from '../../src/rpg/energy.js'

export const config = {
  name: 'arena',
  alias: ['pvpbot'],
  category: 'rpg',
  description: { id: 'Arena RPG: duel melawan petarung bayangan selevel kamu', en: 'RPG arena: duel a shadow fighter around your level' },
  usage: '.arena',
  example: '.arena',
  cooldown: 60,
}

const FOES = [
  { id: 'Petarung Bertopeng', en: 'Masked Fighter' },
  { id: 'Ksatria Pengembara', en: 'Wandering Knight' },
  { id: 'Pemburu Senyap', en: 'Silent Hunter' },
  { id: 'Ahli Pedang Buta', en: 'Blind Swordmaster' },
  { id: 'Penyihir Jalanan', en: 'Street Sorcerer' },
]

export const i18n = {
  id: {
    arena: {
      win: '🏟️ ARENA: kamu menang melawan *{foe}* (power {foePower} vs kamu {power})!\nHadiah: *{coins} koin* + {xp} XP. Rekor arena: {wins} menang, {losses} kalah. Energi tersisa {energy}/100 {mood}',
      lose: '🏟️ ARENA: *{foe}* (power {foePower}) mengalahkan kamu (power {power}) kali ini.\nTetap dapat {xp} XP. Rekor arena: {wins} menang, {losses} kalah. Energi tersisa {energy}/100 {mood}',
      tired: 'Energimu tinggal {energy}/100, kurang buat arena (perlu 15). Pulihkan dengan .heal atau .istirahat dulu yaa~ {mood}',
    },
  },
  en: {
    arena: {
      win: '🏟️ ARENA: you won against *{foe}* (power {foePower} vs yours {power})!\nReward: *{coins} coins* + {xp} XP. Arena record: {wins} wins, {losses} losses. Energy left {energy}/100 {mood}',
      lose: '🏟️ ARENA: *{foe}* (power {foePower}) defeated you (power {power}) this time.\nYou still gain {xp} XP. Arena record: {wins} wins, {losses} losses. Energy left {energy}/100 {mood}',
      tired: 'Your energy is {energy}/100, not enough for the arena (needs 15). Restore with .heal or .istirahat first~ {mood}',
    },
  },
}

export const test = { input: '.arena', expect: /arena/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const spent = await consumeEnergy(ctx.storage, ctx.senderDigits, 15)
  if (!spent.ok) return ctx.reply(ctx.t('arena.tired', { energy: spent.energy, mood: ctx.say('gagal') }))
  const power = Math.max(5, powerOf(profile))
  const foe = FOES[Math.floor(Math.random() * FOES.length)]
  const foePower = Math.max(3, Math.round(power * (0.8 + Math.random() * 0.45)))
  const win = power + Math.random() * 20 >= foePower + Math.random() * 20
  const record = profile.arena ?? { wins: 0, losses: 0 }
  if (win) record.wins += 1
  else record.losses += 1
  const coins = win ? 120 + Math.floor(Math.random() * 160) : 0
  const xp = win ? 15 : 6
  const patch = { arena: record }
  if (coins) patch.balance = (profile.balance ?? 0) + coins
  await updateProfile(ctx.storage, ctx.senderDigits, patch)
  await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t(win ? 'arena.win' : 'arena.lose', {
    foe: ctx.lang === 'en' ? foe.en : foe.id, foePower, power, coins, xp,
    wins: record.wins, losses: record.losses, energy: spent.energy,
    mood: ctx.say(win ? 'sukses' : 'gagal'),
  }))
}
