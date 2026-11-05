
import { getProfile, updateProfile } from '../../src/services/user-service.js'

// Fightnaga: pertarungan naga BERSAMA per grup. Satu naga liar menjaga
// grup (state per grup di storage namespace kv, key fightnaga:<chat>:
// { hp, maxHp, level, defeats }). Tiap .fightnaga, naga peliharaan
// penyerang (pet jenis naga dari .pet, atau level profil bila belum punya)
// menyerang naga grup: HP berkurang sebesar damage. Bila naga tumbang,
// penyerang terakhir dapat hadiah koin dan naga baru yang lebih kuat
// muncul untuk grup itu. Konteks grup adalah mekanik intinya, seperti
// Elaina yang lawannya selalu member grup itu juga.
export const config = {
  name: "fightnaga",
  alias: [],
  category: "rpg",
  description: { id: "Lawan naga liar bersama sama dengan member grup, HP naga per grup", en: "Fight the wild dragon together with group members, dragon HP is per group" },
  usage: ".fightnaga",
  example: ".fightnaga",
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    "fightnaga": {
      hit: "╭─❏ 🐉 「 *FIGHT NAGA* 」\n┊ Naga *@{attacker}* menghantam naga liar grup!\n┊ ᴅᴀᴍᴀɢᴇ: *{damage}* | ʜᴘ ɴᴀɢᴀ: *{hp}/{maxHp}*\n┊ Ayo member lain ikut serang sampai tumbang~\n╰━━━━━━━",
      defeated: "╭─❏ 🐉 「 *NAGA TUMBANG* 」\n┊ Serangan terakhir *@{attacker}* ({damage} damage) menumbangkan naga liar level *{level}*!\n┊ ʜᴀᴅɪᴀʜ: *{reward} ᴋᴏɪɴ* | ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n┊ Naga baru level *{nextLevel}* muncul dengan HP *{nextHp}*~\n╰━━━━━━━",
      status: "╭─❏ 🐉 「 *NAGA GRUP* 」\n┊ ɴᴀɢᴀ ʟɪᴀʀ ʟᴇᴠᴇʟ: *{level}*\n┊ ʜᴘ: *{hp}/{maxHp}*\n┊ ꜱᴜᴅᴀʜ ᴛᴜᴍʙᴀɴɢ: *{defeats} ᴋᴀʟɪ*\n┊ Serang pakai *.fightnaga* yaa~\n╰━━━━━━━",
    },
  },
  en: {
    "fightnaga": {
      hit: "╭─❏ 🐉 「 *DRAGON FIGHT* 」\n┊ *@{attacker}* dragon slams the group wild dragon!\n┊ ᴅᴀᴍᴀɢᴇ: *{damage}* | ᴅʀᴀɢᴏɴ ʜᴘ: *{hp}/{maxHp}*\n┊ Other members, join the attack until it falls~\n╰━━━━━━━",
      defeated: "╭─❏ 🐉 「 *DRAGON DOWN* 」\n┊ The final blow by *@{attacker}* ({damage} damage) felled the level *{level}* wild dragon!\n┊ ʀᴇᴡᴀʀᴅ: *{reward} ᴄᴏɪɴꜱ* | ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n┊ A new level *{nextLevel}* dragon appears with *{nextHp} HP*~\n╰━━━━━━━",
      status: "╭─❏ 🐉 「 *GROUP DRAGON* 」\n┊ ᴡɪʟᴅ ᴅʀᴀɢᴏɴ ʟᴇᴠᴇʟ: *{level}*\n┊ ʜᴘ: *{hp}/{maxHp}*\n┊ ꜰᴇʟʟᴇᴅ: *{defeats} ᴛɪᴍᴇꜱ*\n┊ Attack with *.fightnaga*~\n╰━━━━━━━",
    },
  },
}

export const DRAGON_KEY = (chat) => `fightnaga:${chat}`

export function defaultDragon(level = 1) {
  const lv = Math.max(1, Math.floor(Number(level) || 1))
  const maxHp = 100 + (lv - 1) * 75
  return { hp: maxHp, maxHp, level: lv, defeats: 0 }
}

export async function getGroupDragon(storage, chat) {
  const saved = await storage.get('kv', DRAGON_KEY(chat))
  if (saved && Number.isFinite(Number(saved.hp))) return { ...defaultDragon(saved.level), ...saved }
  return defaultDragon(1)
}

// Terapkan satu serangan ke state naga. Murni, tanpa I/O.
// damage dibatasi minimal 1. Bila hp habis: defeated, state berikutnya
// adalah naga baru satu level lebih tinggi dengan HP penuh.
export function applyDragonHit(state, damage) {
  const dmg = Math.max(1, Math.floor(Number(damage) || 0))
  const hp = Math.max(0, (state.hp ?? state.maxHp) - dmg)
  if (hp > 0) return { state: { ...state, hp }, defeated: false, reward: 0 }
  const reward = 250 * (state.level ?? 1)
  const next = defaultDragon((state.level ?? 1) + 1)
  next.defeats = (state.defeats ?? 0) + 1
  return { state: next, defeated: true, reward }
}

// Kekuatan serangan penyerang: pet naga memberi level pet, selain itu
// level profil RPG yang dipakai, plus acakan kecil.
export function dragonDamage(profile, rng = Math.random) {
  const petLevel = profile?.pet?.kind === 'naga' ? (profile.pet.level ?? 1) : 0
  const base = petLevel > 0 ? petLevel : Math.max(1, Math.floor(Math.sqrt(Math.max(0, profile?.xp ?? 0) / 50)) + 1)
  return base * 8 + 5 + Math.floor(rng() * 16)
}

export const test = { input: '.fightnaga', expect: /naga|dragon/i }
export async function handler(ctx) {
  if ((ctx.args[0] || '').toLowerCase() === 'status') {
    const dragon = await getGroupDragon(ctx.storage, ctx.chat)
    return ctx.reply(ctx.t('fightnaga.status', { level: dragon.level, hp: dragon.hp, maxHp: dragon.maxHp, defeats: dragon.defeats ?? 0 }))
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const dragon = await getGroupDragon(ctx.storage, ctx.chat)
  const damage = dragonDamage(profile)
  const result = applyDragonHit(dragon, damage)
  await ctx.storage.set('kv', DRAGON_KEY(ctx.chat), result.state)
  if (!result.defeated) {
    const body = ctx.t('fightnaga.hit', { attacker: ctx.senderDigits, damage, hp: result.state.hp, maxHp: result.state.maxHp })
    return ctx.sock.sendMessage(ctx.chat, { text: body, mentions: [ctx.sender] }, { quoted: ctx.raw })
  }
  const nextBalance = (profile.balance ?? 0) + result.reward
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: nextBalance })
  const body = ctx.t('fightnaga.defeated', {
    attacker: ctx.senderDigits, damage, level: dragon.level, reward: result.reward, balance: nextBalance,
    nextLevel: result.state.level, nextHp: result.state.maxHp,
  })
  return ctx.sock.sendMessage(ctx.chat, { text: body, mentions: [ctx.sender] }, { quoted: ctx.raw })
}
