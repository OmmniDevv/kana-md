// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "marry",
  alias: [],
  category: "rpg",
  description: { id: "Lamar pemain lain: lamaran tersimpan, menikah resmi bila dia membalas .marry ke kamu", en: "Propose to another player: the proposal is stored, marriage is official when they .marry you back" },
  usage: ".marry <target>",
  example: ".marry <target>",
  cooldown: 5,
}

export const i18n = {
  id: { "marry": {
    "taken": "╭─❏ 💍 「 *MARRY* 」\n┊ Kamu sudah menikah dengan *{partner}*~\n╰━━━━━━━",
    "noTarget": "╭─❏ 💍 「 *MARRY* 」\n┊ Lamar siapa? Mention atau tulis nomornya: *.marry 628XXXX*\n┊ Lamaran diterima bila dia juga menjalankan .marry ke kamu.\n╰━━━━━━━",
    "self": "╭─❏ 💍 「 *MARRY* 」\n┊ Tidak bisa menikahi diri sendiri~\n╰━━━━━━━",
    "targetTaken": "╭─❏ 💍 「 *MARRY* 」\n┊ *{target}* sudah punya pasangan~\n╰━━━━━━━",
    "proposed": "╭─❏ 💍 「 *MARRY* 」\n┊ LAMARAN TERKIRIM ke *{target}*!\n┊ Bila dia menjalankan .marry ke kamu, kalian resmi menikah.\n╰━━━━━━━",
    "married": "╭─❏ 💍 「 *MARRY* 」\n┊ SAH! Kamu dan *{target}* resmi menikah. Selamat~\n┊ Kencan bareng pakai .kencan\n╰━━━━━━━"
} },
  en: { "marry": {
    "taken": "╭─❏ 💍 「 *MARRY* 」\n┊ You are already married to *{partner}*~\n╰━━━━━━━",
    "noTarget": "╭─❏ 💍 「 *MARRY* 」\n┊ Propose to whom? Mention or type the number: *.marry 628XXXX*\n┊ The proposal is accepted when they also run .marry on you.\n╰━━━━━━━",
    "self": "╭─❏ 💍 「 *MARRY* 」\n┊ You cannot marry yourself~\n╰━━━━━━━",
    "targetTaken": "╭─❏ 💍 「 *MARRY* 」\n┊ *{target}* already has a partner~\n╰━━━━━━━",
    "proposed": "╭─❏ 💍 「 *MARRY* 」\n┊ PROPOSAL SENT to *{target}*!\n┊ If they run .marry on you, you are officially married.\n╰━━━━━━━",
    "married": "╭─❏ 💍 「 *MARRY* 」\n┊ OFFICIAL! You and *{target}* are now married. Congrats~\n┊ Go on dates with .kencan\n╰━━━━━━━"
} },
}

export const test = { input: ".marry 6281234567890", expect: /lamaran terkirim|proposal sent|sah!|official!/i }
export async function handler(ctx) {

  const targetDigits = (() => {
    const mention = (ctx.mentionedJids ?? [])[0]
    if (mention) return String(mention).split('@')[0].replace(/\D/g, '')
    if (ctx.quoted?.sender) return String(ctx.quoted.sender).split('@')[0].replace(/\D/g, '')
    const num = (ctx.args ?? []).map((a) => String(a).replace(/\D/g, '')).find((a) => a.length >= 9)
    return num || ''
  })()
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (profile.partner) return ctx.reply(ctx.t('marry.taken', { partner: profile.partner }))
  if (!targetDigits) return ctx.reply(ctx.t('marry.noTarget'))
  if (targetDigits === ctx.senderDigits) return ctx.reply(ctx.t('marry.self'))
  const target = await getProfile(ctx.storage, targetDigits)
  if (target.partner) return ctx.reply(ctx.t('marry.targetTaken', { target: targetDigits }))
  if (profile.marryProposalFrom === targetDigits) {
    profile.partner = targetDigits
    profile.partnerSince = new Date().toISOString()
    delete profile.marryProposalFrom
    target.partner = ctx.senderDigits
    target.partnerSince = profile.partnerSince
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    await saveProfile(ctx.storage, targetDigits, target)
    return ctx.reply(ctx.t('marry.married', { target: targetDigits }))
  }
  target.marryProposalFrom = ctx.senderDigits
  await saveProfile(ctx.storage, targetDigits, target)
  return ctx.reply(ctx.t('marry.proposed', { target: targetDigits }))
}
