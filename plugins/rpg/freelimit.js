// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "freelimit",
  alias: [],
  category: "rpg",
  description: { id: "Klaim +10 limit harian gratis, sekali sehari, masuk ke sistem limit sungguhan", en: "Claim +10 free daily limit, once a day, into the real limit system" },
  usage: ".freelimit",
  example: ".freelimit",
  cooldown: 5,
}

export const i18n = {
  id: { "freelimit": {
    "done": "╭─❏ 🎁 「 *LIMIT GRATIS* 」\n┊ +10 limit hari ini masuk! Limit kamu sekarang *{left}*.\n╰━━━━━━━",
    "wait": "╭─❏ 🎁 「 *LIMIT GRATIS* 」\n┊ Limit gratis hari ini sudah diambil. Limitmu sekarang *{left}*.\n╰━━━━━━━"
} },
  en: { "freelimit": {
    "done": "╭─❏ 🎁 「 *FREE LIMIT* 」\n┊ +10 limit for today added! Your limit is now *{left}*.\n╰━━━━━━━",
    "wait": "╭─❏ 🎁 「 *FREE LIMIT* 」\n┊ Today's free limit is already claimed. Your limit is now *{left}*.\n╰━━━━━━━"
} },
}

export const test = { input: ".freelimit", expect: /limit gratis|free limit/i }
export async function handler(ctx) {

  const { wibDateString, limitState } = await import('../../src/services/user-service.js')
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const today = wibDateString()
  if (profile.last_freelimit === today) return ctx.reply(ctx.t('freelimit.wait', { left: limitState(profile).left }))
  const state = limitState(profile)
  await updateProfile(ctx.storage, ctx.senderDigits, { limitDate: state.date, limitLeft: state.left + 10, last_freelimit: today })
  return ctx.reply(ctx.t('freelimit.done', { left: state.left + 10 }))
}
