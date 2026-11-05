// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
export const config = {
  name: "rob",
  alias: [],
  category: "rpg",
  description: { id: "Merampok pemain lain: target kehilangan koin, kamu bisa ketangkap dan dipenjara", en: "Robbing another player: the target loses coins, you may get caught and jailed" },
  usage: ".rob <target>",
  example: ".rob <target>",
  cooldown: 5,
}

export const i18n = {
  id: { "rob": {
    "jailed": "╭─❏ 🚔 「 *ROB* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *ROB* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🥷 「 *ROB* 」\n┊ Targetnya siapa? Mention, balas pesan, atau tulis nomornya: *.rob 628XXXX*\n╰━━━━━━━",
    "self": "╭─❏ 🥷 「 *ROB* 」\n┊ Masa ngerampok diri sendiri~\n╰━━━━━━━",
    "broke": "╭─❏ 🥷 「 *ROB* 」\n┊ Target *{target}* lagi bokek, tidak ada koin buat dirampok~\n╰━━━━━━━",
    "success": "╭─❏ 🥷 「 *ROB* 」\n┊ BERHASIL! Kamu merampas *{loot} KOIN* dari *{target}*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "caught": "╭─❏ 🚨 「 *ROB* 」\n┊ KETANGKAP SAAT MERAMPOK! Penjara *{minutes} menit*~\n╰━━━━━━━"
} },
  en: { "rob": {
    "jailed": "╭─❏ 🚔 「 *ROB* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *ROB* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "noTarget": "╭─❏ 🥷 「 *ROB* 」\n┊ Who is the target? Mention, reply, or type the number: *.rob 628XXXX*\n╰━━━━━━━",
    "self": "╭─❏ 🥷 「 *ROB* 」\n┊ You cannot rob yourself~\n╰━━━━━━━",
    "broke": "╭─❏ 🥷 「 *ROB* 」\n┊ Target *{target}* is broke, no coins to rob~\n╰━━━━━━━",
    "success": "╭─❏ 🥷 「 *ROB* 」\n┊ SUCCESS! You took *{loot} COINS* from *{target}*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "caught": "╭─❏ 🚨 「 *ROB* 」\n┊ BUSTED WHILE ROBBING! Jailed for *{minutes} minutes*~\n╰━━━━━━━"
} },
}

export const test = { input: ".rob 6281234567890", expect: /bokek|broke|berhasil|success|ketangkap|busted/i }
export async function handler(ctx) {

  const targetDigits = (() => {
    const mention = (ctx.mentionedJids ?? [])[0]
    if (mention) return String(mention).split('@')[0].replace(/\D/g, '')
    if (ctx.quoted?.sender) return String(ctx.quoted.sender).split('@')[0].replace(/\D/g, '')
    const num = (ctx.args ?? []).map((a) => String(a).replace(/\D/g, '')).find((a) => a.length >= 9)
    return num || ''
  })()
  if (!targetDigits) return ctx.reply(ctx.t('rob.noTarget'))
  if (targetDigits === ctx.senderDigits) return ctx.reply(ctx.t('rob.self'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('rob.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < 20) return ctx.reply(ctx.t('rob.lowEnergy', { energy, need: 20 }))
  const target = await getProfile(ctx.storage, targetDigits)
  if ((target.balance ?? 0) <= 0) return ctx.reply(ctx.t('rob.broke', { target: targetDigits }))
  profile.energy = energy - 20
  if (Math.random() < 0.5) {
    const loot = Math.min(target.balance ?? 0, Math.min(300, 50 + Math.floor(Math.random() * 200)))
    target.balance = (target.balance ?? 0) - loot
    profile.balance = (profile.balance ?? 0) + loot
    profile.xp = (profile.xp ?? 0) + 8
    await saveProfile(ctx.storage, targetDigits, target)
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('rob.success', { loot, target: targetDigits, balance: profile.balance }))
  }
  sendToJail(profile, 25)
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('rob.caught', { minutes: 25 }))
}
