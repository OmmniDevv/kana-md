// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { bankDeposit, bankWithdraw, sellItem, buyItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
export const config = {
  name: "nabung",
  alias: [],
  category: "rpg",
  description: { id: "Menabung ke bank RPG: tanpa jumlah berarti 100 koin", en: "Save into the RPG bank: no amount means 100 coins" },
  usage: ".nabung [jumlah]",
  example: ".nabung [jumlah]",
  cooldown: 5,
}

export const i18n = {
  id: { "nabung": {
    "done": "╭─❏ 🏦 「 *NABUNG* 」\n┊ Setor *{amount} KOIN* ke bank berhasil.\n┊ SALDO TUNAI: *{balance}* | BANK: *{bank}*\n╰━━━━━━━",
    "fail": "╭─❏ 🏦 「 *NABUNG* 」\n┊ Setoran gagal ({reason}). Cek saldo tunaimu~\n╰━━━━━━━"
} },
  en: { "nabung": {
    "done": "╭─❏ 🏦 「 *NABUNG* 」\n┊ Deposited *{amount} COINS* to the bank.\n┊ CASH: *{balance}* | BANK: *{bank}*\n╰━━━━━━━",
    "fail": "╭─❏ 🏦 「 *NABUNG* 」\n┊ Deposit failed ({reason}). Check your cash~\n╰━━━━━━━"
} },
}

export const test = { input: ".nabung 100", expect: /setor|deposit|gagal|failed/i }
export async function handler(ctx) {

  const raw = (ctx.args ?? [])[0]
  const amount = raw === undefined ? 100 : raw
  const result = await bankDeposit(ctx.storage, ctx.senderDigits, amount)
  if (!result.ok) return ctx.reply(ctx.t('nabung.fail', { reason: result.reason }))
  return ctx.reply(ctx.t('nabung.done', { amount: result.amount, balance: result.balance, bank: result.bank }))
}
