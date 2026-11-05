// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { bankDeposit, bankWithdraw, sellItem, buyItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { reasonText } from '../../src/rpg/reasons.js'
export const config = {
  name: "deps",
  alias: [],
  category: "rpg",
  description: { id: "Setor koin tunai ke bank RPG (saldo bank terpisah dan tersimpan)", en: "Deposit cash coins into the RPG bank (separate stored bank balance)" },
  usage: ".deps [jumlah]",
  example: ".deps [jumlah]",
  cooldown: 5,
}

export const i18n = {
  id: { "deps": {
    "done": "╭─❏ 🏦 「 *DEPS* 」\n┊ Setor *{amount} KOIN* ke bank berhasil.\n┊ SALDO TUNAI: *{balance}* | BANK: *{bank}*\n╰━━━━━━━",
    "fail": "╭─❏ 🏦 「 *DEPS* 」\n┊ Setoran gagal ({reason}). Cek saldo tunaimu~\n╰━━━━━━━"
} },
  en: { "deps": {
    "done": "╭─❏ 🏦 「 *DEPS* 」\n┊ Deposited *{amount} COINS* to the bank.\n┊ CASH: *{balance}* | BANK: *{bank}*\n╰━━━━━━━",
    "fail": "╭─❏ 🏦 「 *DEPS* 」\n┊ Deposit failed ({reason}). Check your cash~\n╰━━━━━━━"
} },
}

export const test = { input: ".deps 100", expect: /setor|deposit|gagal|failed/i }
export async function handler(ctx) {

  const raw = (ctx.args ?? [])[0]
  const amount = raw ?? 'all'
  const result = await bankDeposit(ctx.storage, ctx.senderDigits, amount)
  if (!result.ok) return ctx.reply(ctx.t('deps.fail', { reason: reasonText(result.reason, ctx.lang) }))
  return ctx.reply(ctx.t('deps.done', { amount: result.amount, balance: result.balance, bank: result.bank }))
}
