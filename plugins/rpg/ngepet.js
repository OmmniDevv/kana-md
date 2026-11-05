// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "ngepet",
  alias: [],
  category: "rpg",
  description: { id: "Ngepet: petmu keliling membawa pulang koin per jam, besar sesuai level pet", en: "Ngepet: your pet roams and brings home coins hourly, scaled by pet level" },
  usage: ".ngepet",
  example: ".ngepet",
  cooldown: 5,
}

export const i18n = {
  id: { "ngepet": {
    "noPet": "╭─❏ 👻 「 *NGEPET* 」\n┊ Ngepet butuh pet sebagai perantara. Adopsi dulu pakai .adopt~\n╰━━━━━━━",
    "wait": "╭─❏ 👻 「 *NGEPET* 」\n┊ Petmu masih keliling, tunggu *{minutes} menit* lagi~\n╰━━━━━━━",
    "done": "╭─❏ 👻 「 *NGEPET* 」\n┊ *{pet}* pulang membawa *+{coins} KOIN* hasil keliling semalam.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "ngepet": {
    "noPet": "╭─❏ 👻 「 *NGEPET* 」\n┊ Ngepet needs a pet as the earner. Adopt one with .adopt~\n╰━━━━━━━",
    "wait": "╭─❏ 👻 「 *NGEPET* 」\n┊ Your pet is still out roaming, wait *{minutes} more minutes*~\n╰━━━━━━━",
    "done": "╭─❏ 👻 「 *NGEPET* 」\n┊ *{pet}* came home carrying *+{coins} COINS* from last night's rounds.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".ngepet", expect: /membawa|carrying|butuh pet|needs a pet|masih keliling/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.pet) return ctx.reply(ctx.t('ngepet.noPet'))
  const now = Date.now()
  const last = Number(profile.last_ngepet) || 0
  const cdMs = 3600000
  if (now - last < cdMs) return ctx.reply(ctx.t('ngepet.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const level = profile.pet.level ?? 1
  const coins = 30 + level * 20 + Math.floor(Math.random() * 60)
  profile.balance = (profile.balance ?? 0) + coins
  profile.last_ngepet = now
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 5)
  return ctx.reply(ctx.t('ngepet.done', { pet: profile.pet.name, coins, balance: profile.balance }))
}
