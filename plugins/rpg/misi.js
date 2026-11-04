import { getProfile, updateProfile, addXp, wibDateString } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { consumeEnergy } from '../../src/rpg/energy.js'

export const config = {
  name: 'misi',
  alias: ['quest', 'misiharian', 'dailymisi'],
  category: 'rpg',
  description: { id: 'Misi harian RPG: 3 misi per hari, peluang sukses dari power kamu', en: 'Daily RPG quests: 3 quests per day, success chance from your power' },
  usage: '.misi',
  example: '.misi',
  cooldown: 15,
}

const QUESTS = [
  { id: 'mengusir slime dari ladang gandum', en: 'chasing slimes out of the wheat field', power: 5, coins: [40, 90] },
  { id: 'menemukan kucing kepala desa yang hilang', en: 'finding the village chief lost cat', power: 8, coins: [50, 110] },
  { id: 'membersihkan sarang goblin di tepi hutan', en: 'clearing a goblin nest at the forest edge', power: 16, coins: [80, 160] },
  { id: 'menjaga gerbang kota semalaman', en: 'guarding the city gate overnight', power: 22, coins: [100, 200] },
  { id: 'mengambil ramuan langka di gua', en: 'fetching a rare herb in the cave', power: 30, coins: [130, 260] },
  { id: 'mengantar surat penting melewati wilayah bandit', en: 'delivering an important letter through bandit territory', power: 38, coins: [160, 320] },
  { id: 'menyelamatkan pedagang dari troll', en: 'rescuing a merchant from a troll', power: 55, coins: [220, 420] },
  { id: 'menjelajah reruntuhan menara lama', en: 'exploring the old tower ruins', power: 70, coins: [300, 550] },
]

export const i18n = {
  id: {
    misi: {
      win: '📜 MISI SELESAI: {quest}\nHadiah: *{coins} koin* + {xp} XP.\nMisi hari ini: {done}/3 · Energi tersisa {energy}/100 {mood}',
      lose: '📜 MISI GAGAL: {quest}\nLawan terlalu kuat buat power kamu ({power}). Tetap dapat {xp} XP pengalaman.\nMisi hari ini: {done}/3 · Energi tersisa {energy}/100 {mood}',
      doneAll: 'Tiga misi hari ini sudah kamu ambil semua. Papan misi diperbarui besok yaa~ Cek .rpg buat statusmu. {mood}',
      tired: 'Energimu tinggal {energy}/100, kurang buat misi (perlu 10). Pulihkan dengan .heal atau .istirahat dulu yaa~ {mood}',
    },
  },
  en: {
    misi: {
      win: '📜 QUEST DONE: {quest}\nReward: *{coins} coins* + {xp} XP.\nQuests today: {done}/3 · Energy left {energy}/100 {mood}',
      lose: '📜 QUEST FAILED: {quest}\nThe foe is too strong for your power ({power}). You still gain {xp} XP of experience.\nQuests today: {done}/3 · Energy left {energy}/100 {mood}',
      doneAll: 'You already took all three quests today. The quest board refreshes tomorrow~ Check .rpg for your status. {mood}',
      tired: 'Your energy is {energy}/100, not enough for a quest (needs 10). Restore with .heal or .istirahat first~ {mood}',
    },
  },
}

export const test = { input: '.misi', expect: /misi|quest/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const today = wibDateString(new Date())
  const doneToday = profile.misiDate === today ? Number(profile.misiDone ?? 0) : 0
  if (doneToday >= 3) return ctx.reply(ctx.t('misi.doneAll', { mood: ctx.say('senang') }))
  const spent = await consumeEnergy(ctx.storage, ctx.senderDigits, 10)
  if (!spent.ok) return ctx.reply(ctx.t('misi.tired', { energy: spent.energy, mood: ctx.say('gagal') }))
  const quest = QUESTS[Math.floor(Math.random() * QUESTS.length)]
  const power = powerOf(profile)
  const chance = Math.min(0.95, Math.max(0.25, 0.55 + (power - quest.power) / 100))
  const win = Math.random() < chance
  const done = doneToday + 1
  const patch = { misiDate: today, misiDone: done }
  if (win) {
    const coins = quest.coins[0] + Math.floor(Math.random() * (quest.coins[1] - quest.coins[0] + 1))
    patch.balance = (profile.balance ?? 0) + coins
    await updateProfile(ctx.storage, ctx.senderDigits, patch)
    await addXp(ctx.storage, ctx.senderDigits, 12)
    return ctx.reply(ctx.t('misi.win', {
      quest: ctx.lang === 'en' ? quest.en : quest.id,
      coins, xp: 12, done, energy: spent.energy, mood: ctx.say('sukses'),
    }))
  }
  await updateProfile(ctx.storage, ctx.senderDigits, patch)
  await addXp(ctx.storage, ctx.senderDigits, 4)
  return ctx.reply(ctx.t('misi.lose', {
    quest: ctx.lang === 'en' ? quest.en : quest.id,
    power, xp: 4, done, energy: spent.energy, mood: ctx.say('gagal'),
  }))
}
