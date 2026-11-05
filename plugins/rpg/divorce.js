// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "divorce",
  alias: [],
  category: "rpg",
  description: { id: "Cerai: status pasangan terhapus dari profil kedua pihak", en: "Divorce: partner status is removed from both profiles" },
  usage: ".divorce",
  example: ".divorce",
  cooldown: 5,
}

export const i18n = {
  id: { "divorce": {
    "single": "╭─❏ 💔 「 *DIVORCE* 」\n┊ Kamu belum menikah, tidak ada yang diceraikan~\n╰━━━━━━━",
    "done": "╭─❏ 💔 「 *DIVORCE* 」\n┊ RESMI BERPISAH dari *{partner}*. Status kalian berdua kembali lajang di profil.\n╰━━━━━━━"
} },
  en: { "divorce": {
    "single": "╭─❏ 💔 「 *DIVORCE* 」\n┊ You are not married, nobody to divorce~\n╰━━━━━━━",
    "done": "╭─❏ 💔 「 *DIVORCE* 」\n┊ OFFICIALLY SPLIT from *{partner}*. Both profiles are single again.\n╰━━━━━━━"
} },
}

export const test = { input: ".divorce", expect: /belum menikah|not married|berpisah|split/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.partner) return ctx.reply(ctx.t('divorce.single'))
  const partnerDigits = profile.partner
  const partner = await getProfile(ctx.storage, partnerDigits)
  delete profile.partner
  delete profile.partnerSince
  if (partner.partner === ctx.senderDigits) { delete partner.partner; delete partner.partnerSince; await saveProfile(ctx.storage, partnerDigits, partner) }
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('divorce.done', { partner: partnerDigits }))
}
