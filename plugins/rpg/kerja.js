import { getProfile, updateProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { consumeEnergy } from '../../src/rpg/energy.js'

export const config = {
  name: 'kerja',
  alias: ['work', 'ojek', 'ngojek', 'taxi', 'mulung', 'berlatih'],
  category: 'rpg',
  description: { id: 'Kerja sambilan RPG: dapat koin dan XP, makan 15 energi', en: 'RPG side job: earn coins and XP, costs 15 energy' },
  usage: '.kerja',
  example: '.kerja',
  cooldown: 30,
}

const JOBS = [
  { id: 'mengantar paket ke desa sebelah', en: 'delivering a package to the next village' },
  { id: 'membantu pandai besi seharian', en: 'helping the blacksmith all day' },
  { id: 'menjaga toko ramuan', en: 'watching the potion shop' },
  { id: 'membersihkan gudang guild', en: 'cleaning the guild warehouse' },
  { id: 'mengawal pedagang keliling', en: 'escorting a traveling merchant' },
  { id: 'memanen ladang milik petani', en: 'harvesting a farmer field' },
  { id: 'memperbaiki jembatan kayu', en: 'repairing the wooden bridge' },
  { id: 'menjadi penerjemah goblin', en: 'being a goblin translator' },
]

export const i18n = {
  id: {
    kerja: {
      done: '💼 Kamu kerja {job} dan dapat *{coins} koin* + {xp} XP.\nEnergi tersisa: {energy}/100 {mood}',
      tired: 'Energimu tinggal {energy}/100, kurang buat kerja (perlu 15). Pulihkan dulu dengan .heal atau .istirahat yaa~ {mood}',
      wait: 'Kamu baru saja kerja, istirahat sebentar yaa. Bisa kerja lagi dalam {minutes} menit~ {mood}',
    },
  },
  en: {
    kerja: {
      done: '💼 You worked {job} and earned *{coins} coins* + {xp} XP.\nEnergy left: {energy}/100 {mood}',
      tired: 'Your energy is {energy}/100, not enough to work (needs 15). Restore it with .heal or .istirahat first~ {mood}',
      wait: 'You just worked, take a short break. You can work again in {minutes} minutes~ {mood}',
    },
  },
}

export const test = { input: '.kerja', expect: /kerja|work/i }

const WAIT_MS = 30 * 60_000

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const now = Date.now()
  if (profile.lastKerja && now - profile.lastKerja < WAIT_MS) {
    const minutes = Math.ceil((WAIT_MS - (now - profile.lastKerja)) / 60000)
    return ctx.reply(ctx.t('kerja.wait', { minutes, mood: ctx.say('ngantuk') }))
  }
  const spent = await consumeEnergy(ctx.storage, ctx.senderDigits, 15)
  if (!spent.ok) return ctx.reply(ctx.t('kerja.tired', { energy: spent.energy, mood: ctx.say('gagal') }))
  const level = levelFromXp(profile.xp ?? 0)
  const coins = 30 + Math.floor(Math.random() * 60) + level * 5
  const xp = 8
  const job = JOBS[Math.floor(Math.random() * JOBS.length)]
  await updateProfile(ctx.storage, ctx.senderDigits, {
    balance: (profile.balance ?? 0) + coins,
    lastKerja: now,
  })
  await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t('kerja.done', {
    job: ctx.lang === 'en' ? job.en : job.id,
    coins, xp, energy: spent.energy, mood: ctx.say('sukses'),
  }))
}
