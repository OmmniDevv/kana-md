// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "gift",
  alias: [],
  category: "rpg",
  description: { id: "Kirim koin hadiah ke pemain lain, saldo kedua pihak berubah sungguhan", en: "Gift coins to another player, both balances really change" },
  usage: ".gift <target> <jumlah>",
  example: ".gift <target> <jumlah>",
  cooldown: 5,
}

export const i18n = {
  id: { "gift": {
    "noTarget": "╭─❏ 🎁 「 *GIFT* 」\n┊ Penerimanya siapa? Contoh: *.gift 628XXXX 100*\n╰━━━━━━━",
    "self": "╭─❏ 🎁 「 *GIFT* 」\n┊ Tidak bisa kirim hadiah ke diri sendiri~\n╰━━━━━━━",
    "noAmount": "╭─❏ 🎁 「 *GIFT* 」\n┊ Jumlahnya berapa? Contoh: *.gift 628XXXX 100*\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *GIFT* 」\n┊ Saldomu *{balance} KOIN*, tidak cukup buat kirim *{amount}*~\n╰━━━━━━━",
    "done": "╭─❏ 🎁 「 *GIFT* 」\n┊ Terkirim! *{amount} KOIN* buat *{target}*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "gift": {
    "noTarget": "╭─❏ 🎁 「 *GIFT* 」\n┊ Who receives it? EXample: *.gift 628XXXX 100*\n╰━━━━━━━",
    "self": "╭─❏ 🎁 「 *GIFT* 」\n┊ You cannot gift yourself~\n╰━━━━━━━",
    "noAmount": "╭─❏ 🎁 「 *GIFT* 」\n┊ How much? EXample: *.gift 628XXXX 100*\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *GIFT* 」\n┊ Your balance is *{balance} COINS*, not enough to send *{amount}*~\n╰━━━━━━━",
    "done": "╭─❏ 🎁 「 *GIFT* 」\n┊ Sent! *{amount} COINS* for *{target}*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".gift 6281234567890 100", expect: /terkirim|sent|saldo|balance/i }
export async function handler(ctx) {

  const targetDigits = (() => {
    const mention = (ctx.mentionedJids ?? [])[0]
    if (mention) return String(mention).split('@')[0].replace(/\D/g, '')
    if (ctx.quoted?.sender) return String(ctx.quoted.sender).split('@')[0].replace(/\D/g, '')
    const num = (ctx.args ?? []).map((a) => String(a).replace(/\D/g, '')).find((a) => a.length >= 9)
    return num || ''
  })()
  const nums = (ctx.args ?? []).map((a) => Number(String(a).replace(/\D/g, ''))).filter((n) => Number.isFinite(n) && n > 0)
  const amount = nums.find((n) => String(n) !== targetDigits) ?? 0
  if (!targetDigits) return ctx.reply(ctx.t('gift.noTarget'))
  if (targetDigits === ctx.senderDigits) return ctx.reply(ctx.t('gift.self'))
  if (!amount) return ctx.reply(ctx.t('gift.noAmount'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if ((profile.balance ?? 0) < amount) return ctx.reply(ctx.t('gift.poor', { balance: profile.balance ?? 0, amount }))
  const target = await getProfile(ctx.storage, targetDigits)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) - amount })
  await updateProfile(ctx.storage, targetDigits, { balance: (target.balance ?? 0) + amount })
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('gift.done', { amount, target: targetDigits, balance: fresh.balance ?? 0 }))
}
