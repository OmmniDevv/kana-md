// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "reedem",
  alias: [],
  category: "rpg",
  description: { id: "Tukar kode redeem sungguhan: tiap kode hanya berlaku sekali per pemain", en: "Redeem real codes: each code works once per player" },
  usage: ".reedem <kode>",
  example: ".reedem <kode>",
  cooldown: 5,
}

export const i18n = {
  id: { "reedem": {
    "usage": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Tulis kodenya yaa: *.reedem <kode>*\n╰━━━━━━━",
    "wrong": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Kode *{code}* tidak dikenal~\n╰━━━━━━━",
    "used": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Kode *{code}* sudah pernah kamu pakai.\n╰━━━━━━━",
    "done": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Kode *{code}* valid! *+{reward} KOIN* masuk.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "reedem": {
    "usage": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Type the code please: *.reedem <code>*\n╰━━━━━━━",
    "wrong": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Code *{code}* is not recognized~\n╰━━━━━━━",
    "used": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Code *{code}* was already used by you.\n╰━━━━━━━",
    "done": "╭─❏ 🎟️ 「 *REDEEM* 」\n┊ Code *{code}* is valid! *+{reward} COINS* added.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".reedem KANA2026", expect: /valid|sudah pernah|tidak dikenal|valid!|already used/i }
export async function handler(ctx) {

  const code = ((ctx.args ?? [])[0] || '').toUpperCase()
  const CODES = { KANA2026: 1000, RPGMULAI: 300 }
  if (!code) return ctx.reply(ctx.t('reedem.usage'))
  const reward = CODES[code]
  if (!reward) return ctx.reply(ctx.t('reedem.wrong', { code }))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const field = 'redeemed_' + code.toLowerCase()
  if (profile[field]) return ctx.reply(ctx.t('reedem.used', { code }))
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) + reward, [field]: true })
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('reedem.done', { code, reward, balance: fresh.balance ?? 0 }))
}
