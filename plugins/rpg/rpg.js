import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, levelFromXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { JOB_MAP, PET_MAP } from '../../src/rpg/data.js'

const here = dirname(fileURLToPath(import.meta.url))

export const config = {
  name: 'rpg',
  alias: [],
  category: 'rpg',
  description: { id: 'Lihat profil RPG kamu: level, koin, bank, job, pet, clan', en: 'See your RPG profile: level, coins, bank, job, pet, clan' },
  usage: '.rpg',
  example: '.rpg',
  cooldown: 3,
}

export const i18n = {
  id: {
    rpg: {
      card: '⚔️ PROFIL RPG ⚔️\nNama: {name}\nLevel: {level} (XP {xp})\nPower: {power}\nKoin: {coins}\nSaldo bank: {bank}\nJob: {job}\nPet: {pet}\nClan: {clan}\n{mood}',
      noJob: 'belum ada, pilih di .job yaa',
      noPet: 'belum ada, adopsi di .pet',
      noClan: 'belum ada, buat di .clan',
      petInfo: '{emoji} {name} level {level}',
      caption: 'Profil RPG {name} ⚔️',
      hint: 'Pencet tombolnya buat lanjut petualangan~',
      btnMenu: 'Menu RPG',
      btnDaily: 'Klaim Harian',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    rpg: {
      card: '⚔️ RPG PROFILE ⚔️\nName: {name}\nLevel: {level} (XP {xp})\nPower: {power}\nCoins: {coins}\nBank balance: {bank}\nJob: {job}\nPet: {pet}\nClan: {clan}\n{mood}',
      noJob: 'none yet, pick one in .job',
      noPet: 'none yet, adopt in .pet',
      noClan: 'none yet, create in .clan',
      petInfo: '{emoji} {name} level {level}',
      caption: 'RPG profile of {name} ⚔️',
      hint: 'Tap a button to continue the adventure~',
      btnMenu: 'RPG Menu',
      btnDaily: 'Daily Claim',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

export const test = { input: '.rpg', expect: /profil rpg/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const job = profile.job ? JOB_MAP[profile.job] : null
  const petDef = profile.pet ? PET_MAP[profile.pet.kind] : null
  const petText = profile.pet
    ? ctx.t('rpg.petInfo', {
        emoji: petDef?.emoji ?? '🐾',
        name: petDef ? petDef.name[ctx.lang] ?? petDef.name.id : profile.pet.kind,
        level: profile.pet.level ?? 1,
      })
    : ctx.t('rpg.noPet')
  const body = ctx.t('rpg.card', {
    name: profile.name || ctx.pushName || '-',
    level: levelFromXp(profile.xp ?? 0),
    xp: profile.xp ?? 0,
    power: powerOf(profile),
    coins: profile.balance ?? 0,
    bank: profile.bank ?? 0,
    job: job ? `${job.emoji} ${job.name[ctx.lang] ?? job.name.id}` : ctx.t('rpg.noJob'),
    pet: petText,
    clan: profile.clanId || ctx.t('rpg.noClan'),
    mood: ctx.say('senang'),
  })
  let image = null
  try {
    image = await readFile(join(here, '../../assets/rpg.jpg'))
  } catch {
    image = null
  }
  if (image) {
    await ctx.sock.sendMessage(ctx.chat, { image, caption: ctx.t('rpg.caption', { name: ctx.pushName || '-' }) }, { quoted: ctx.raw })
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body: image ? `${body}\n\n${ctx.t('rpg.hint')}` : body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('rpg.btnMenu'), id: '.menurpg' },
      { text: ctx.t('rpg.btnDaily'), id: '.daily' },
      { text: ctx.t('rpg.btnInventory'), id: '.inventory' },
      { text: ctx.t('rpg.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
