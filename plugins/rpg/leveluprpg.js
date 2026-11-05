// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// cuma membalas ringkasan. Level di KANA dihitung dari XP, jadi perintah
// ini sekarang MELAKUKAN klaim hadiah level yang belum diambil: tiap level
// baru sejak klaim terakhir (profile.levelClaimed) memberi 100 x level
// koin, tersimpan, dan hanya bisa diklaim sekali.
import { getProfile, updateProfile, levelFromXp, xpForLevel } from '../../src/services/user-service.js'

export const config = {
  name: 'leveluprpg',
  alias: [],
  category: 'rpg',
  description: { id: 'Klaim hadiah level RPG yang belum diambil: 100 x level koin per level baru', en: 'Claim unclaimed RPG level rewards: 100 x level coins per new level' },
  usage: '.leveluprpg',
  example: '.leveluprpg',
  cooldown: 5,
}

export const i18n = {
  id: {
    leveluprpg: {
      done: '╭─❏ ⬆️ 「 *LEVEL UP RPG* 」\n┊ Selamat, kamu naik ke *level {level}*!\n┊ Hadiah klaim: *+{reward} koin* (dari level {from} ke {level})\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      none: '╭─❏ ⬆️ 「 *LEVEL UP RPG* 」\n┊ Belum ada level baru buat diklaim. Level kamu *{level}*, kurang *{remain} XP* lagi ke level {next}\n┊ Hadiah per level baru: 100 x level koin\n╰━━━━━━━',
    },
  },
  en: {
    leveluprpg: {
      done: '╭─❏ ⬆️ 「 *RPG LEVEL UP* 」\n┊ Congrats, you reached *level {level}*!\n┊ Claimed reward: *+{reward} coins* (from level {from} to {level})\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      none: '╭─❏ ⬆️ 「 *RPG LEVEL UP* 」\n┊ No new level to claim yet. You are *level {level}*, *{remain} XP* short of level {next}\n┊ Reward per new level: 100 x level coins\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.leveluprpg', expect: /hadiah klaim|belum ada level baru|claimed reward|no new level/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const level = levelFromXp(profile.xp ?? 0)
  const claimed = Math.max(1, Math.floor(Number(profile.levelClaimed) || 1))
  if (level <= claimed) {
    const remain = Math.max(0, xpForLevel(level + 1) - (profile.xp ?? 0))
    return ctx.reply(ctx.t('leveluprpg.none', { level, remain, next: level + 1 }))
  }
  let reward = 0
  for (let l = claimed + 1; l <= level; l++) reward += 100 * l
  const balance = (profile.balance ?? 0) + reward
  await updateProfile(ctx.storage, ctx.senderDigits, { balance, levelClaimed: level })
  return ctx.reply(ctx.t('leveluprpg.done', { level, reward, from: claimed, balance }))
}
