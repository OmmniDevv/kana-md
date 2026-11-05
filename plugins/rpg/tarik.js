// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { bankDeposit, bankWithdraw, sellItem, buyItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
export const config = {
  name: "tarik",
  alias: [],
  category: "rpg",
  description: { id: "Tarik koin dari bank RPG kembali ke tunai", en: "Withdraw coins from the RPG bank back to cash" },
  usage: ".tarik [jumlah]",
  example: ".tarik [jumlah]",
  cooldown: 5,
}

export const i18n = {
  id: { "tarik": {
    "done": "╭─❏ 🏦 「 *TARIK* 」\n┊ Tarik *{amount} KOIN* dari bank berhasil.\n┊ SALDO TUNAI: *{balance}* | BANK: *{bank}*\n╰━━━━━━━",
    "fail": "╭─❏ 🏦 「 *TARIK* 」\n┊ Penarikan gagal ({reason}). Cek saldo bankmu~\n╰━━━━━━━"
} },
  en: { "tarik": {
    "done": "╭─❏ 🏦 「 *WITHDRAW* 」\n┊ Withdrew *{amount} COINS* from the bank.\n┊ CASH: *{balance}* | BANK: *{bank}*\n╰━━━━━━━",
    "fail": "╭─❏ 🏦 「 *WITHDRAW* 」\n┊ Withdrawal failed ({reason}). Check your bank balance~\n╰━━━━━━━"
} },
}

export const test = { input: ".tarik 50", expect: /tarik|withdrew|gagal|failed/i }
export async function handler(ctx) {

  const raw = (ctx.args ?? [])[0]
  const result = await bankWithdraw(ctx.storage, ctx.senderDigits, raw ?? 'all')
  if (!result.ok) return ctx.reply(ctx.t('tarik.fail', { reason: result.reason }))
  return ctx.reply(ctx.t('tarik.done', { amount: result.amount, balance: result.balance, bank: result.bank }))
}
