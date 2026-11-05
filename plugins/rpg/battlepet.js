// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin bet
// angka generik yang bahkan tidak memeriksa pet. Sekarang pertarungan pet
// sungguhan: pet milikmu (profile.pet) melawan pet liar; kekuatan dari
// level pet, menang menaikkan XP dan level pet beneran, tersimpan.
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { PET_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'battlepet',
  alias: [],
  category: 'rpg',
  description: { id: 'Adu pet milikmu lawan pet liar: menang menaikkan XP dan level pet beneran', en: 'Battle your pet against a wild pet: winning really raises its XP and level' },
  usage: '.battlepet',
  example: '.battlepet',
  cooldown: 10,
}

export const WILD_PETS = [
  { kind: 'kucing', bonus: 0 },
  { kind: 'anjing', bonus: 2 },
  { kind: 'burung', bonus: 1 },
  { kind: 'naga', bonus: 4 },
]

export const i18n = {
  id: {
    battlepet: {
      noPet: '╭─❏ 🐾 「 *BATTLEPET* 」\n┊ Kamu belum punya pet buat diadu. Adopsi dulu pakai .petshop adopsi <jenis>~\n╰━━━━━━━',
      win: '╭─❏ 🐾 「 *BATTLEPET* 」\n┊ {emoji} *{name}* (power {mine}) vs pet liar {wemoji} *{wild}* (power {wpower}): MENANG!\n┊ XP pet +{xp}, level pet sekarang *{level}* | Bonus *+{coins} koin*, saldo: *{balance} koin*\n╰━━━━━━━',
      lose: '╭─❏ 🐾 「 *BATTLEPET* 」\n┊ {emoji} *{name}* (power {mine}) vs pet liar {wemoji} *{wild}* (power {wpower}): kalah, tapi tetap dapat XP pet +{xp}\n┊ Level pet: *{level}* | Saldo: *{balance} koin*\n╰━━━━━━━',
    },
  },
  en: {
    battlepet: {
      noPet: '╭─❏ 🐾 「 *BATTLEPET* 」\n┊ You have no pet to battle yet. Adopt one with .petshop adopsi <kind>~\n╰━━━━━━━',
      win: '╭─❏ 🐾 「 *BATTLEPET* 」\n┊ {emoji} *{name}* (power {mine}) vs wild pet {wemoji} *{wild}* (power {wpower}): YOU WIN!\n┊ Pet XP +{xp}, pet level is now *{level}* | Bonus *+{coins} coins*, balance: *{balance} coins*\n╰━━━━━━━',
      lose: '╭─❏ 🐾 「 *BATTLEPET* 」\n┊ {emoji} *{name}* (power {mine}) vs wild pet {wemoji} *{wild}* (power {wpower}): you lose, but still gain pet XP +{xp}\n┊ Pet level: *{level}* | Balance: *{balance} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.battlepet', expect: /belum punya pet|no pet to battle|xp pet|pet xp/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.pet) return ctx.reply(ctx.t('battlepet.noPet'))
  const pet = { ...profile.pet }
  const wildDef = WILD_PETS[Math.floor(Math.random() * WILD_PETS.length)]
  const wildPet = PET_MAP[wildDef.kind]
  const wildLevel = Math.max(1, (pet.level ?? 1) + Math.floor(Math.random() * 3) - 1)
  const myPower = (pet.level ?? 1) * 10 + Math.floor(Math.random() * 21)
  const wildPower = wildLevel * 10 + wildDef.bonus + Math.floor(Math.random() * 21)
  const win = myPower >= wildPower
  const xpGain = win ? 30 : 8
  pet.xp = (pet.xp ?? 0) + xpGain
  pet.level = 1 + Math.floor(pet.xp / 100)
  const coins = win ? 40 + Math.floor(Math.random() * 61) : 0
  const balance = (profile.balance ?? 0) + coins
  await updateProfile(ctx.storage, ctx.senderDigits, { pet, balance })
  const myDef = PET_MAP[pet.kind]
  const vars = {
    emoji: myDef?.emoji ?? '🐾',
    name: pet.name,
    mine: myPower,
    wemoji: wildPet?.emoji ?? '🐾',
    wild: (ctx.lang === 'en' ? wildPet?.name.en : wildPet?.name.id) + ' lv' + wildLevel,
    wpower: wildPower,
    xp: xpGain,
    level: pet.level,
    coins,
    balance,
  }
  return ctx.reply(ctx.t(win ? 'battlepet.win' : 'battlepet.lose', vars))
}
