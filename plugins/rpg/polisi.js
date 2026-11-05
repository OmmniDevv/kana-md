// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
export const config = {
  name: "polisi",
  alias: [],
  category: "rpg",
  description: { id: "Cek catatan penjara seseorang dari sistem penjara sungguhan", en: "Check someone's jail record from the real jail system" },
  usage: ".polisi [target]",
  example: ".polisi [target]",
  cooldown: 5,
}

export const i18n = {
  id: { "polisi": {
    "clean": "╭─❏ 👮 「 *POLISI* 」\n┊ Catatan *{target}* bersih, tidak sedang dipenjara.\n╰━━━━━━━",
    "jailed": "╭─❏ 👮 「 *POLISI* 」\n┊ *{target}* sedang dipenjara, sisa *{minutes} menit*.\n┊ Denda bebas: *{fine} KOIN* (bayar sendiri via .bebaskan)\n╰━━━━━━━"
} },
  en: { "polisi": {
    "clean": "╭─❏ 👮 「 *POLISI* 」\n┊ *{target}* has a clean record, not jailed.\n╰━━━━━━━",
    "jailed": "╭─❏ 👮 「 *POLISI* 」\n┊ *{target}* is jailed, *{minutes} minutes* left.\n┊ Bail fine: *{fine} COINS* (pay it themselves via .bebaskan)\n╰━━━━━━━"
} },
}

export const test = { input: ".polisi", expect: /bersih|clean|dipenjara|jailed/i }
export async function handler(ctx) {

  const targetDigits = (() => {
    const mention = (ctx.mentionedJids ?? [])[0]
    if (mention) return String(mention).split('@')[0].replace(/\D/g, '')
    if (ctx.quoted?.sender) return String(ctx.quoted.sender).split('@')[0].replace(/\D/g, '')
    const num = (ctx.args ?? []).map((a) => String(a).replace(/\D/g, '')).find((a) => a.length >= 9)
    return num || ''
  })()
  const who = targetDigits || ctx.senderDigits
  const target = await getProfile(ctx.storage, who)
  if (!isJailed(target)) return ctx.reply(ctx.t('polisi.clean', { target: who }))
  return ctx.reply(ctx.t('polisi.jailed', { target: who, minutes: jailMinutesLeft(target), fine: fineAmount(target) }))
}
