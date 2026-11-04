import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'transfer',
  alias: ['tf', 'sawer'],
  category: 'user',
  description: { id: 'Kirim koin saldo kamu ke pengguna lain', en: 'Send your balance coins to another user' },
  usage: '.transfer <nomor> <jumlah>',
  example: '.transfer 628123456789 500',
  cooldown: 3,
}

export const i18n = {
  id: {
    transfer: {
      usage: 'Formatnya: .transfer <nomor tujuan> <jumlah>, contoh: .transfer 628123456789 500. Minimal 100 koin yaa~ 💸',
      badNumber: 'Nomor tujuannya harus 9 sampai 15 digit angka yaa~',
      self: 'Ehh, nggak bisa transfer ke diri sendiri dong (≧▽≦) Pilih nomor lain yaa~',
      badAmount: 'Jumlahnya harus angka bulat minimal 100 koin yaa~',
      noBalance: 'Mouu, saldo kamu kurang. Kamu punya {balance} koin, mau kirim {amount} koin (╥﹏╥)',
      done: 'Transfer beres! 💸\nKamu kirim {amount} koin ke {number}.\nSaldo kamu sekarang: {senderBalance} koin\nSaldo penerima sekarang: {receiverBalance} koin\n\n{mood}',
      btnProfile: 'Profil Aku',
      btnMenu: 'Menu User',
    },
  },
  en: {
    transfer: {
      usage: 'Format: .transfer <destination number> <amount>, example: .transfer 628123456789 500. Minimum 100 coins~ 💸',
      badNumber: 'The destination number must be 9 to 15 digits~',
      self: 'Eh, you cannot transfer to yourself (≧▽≦) Pick another number~',
      badAmount: 'The amount must be a whole number of at least 100 coins~',
      noBalance: 'Mouu, your balance is not enough. You have {balance} coins and tried to send {amount} coins (╥﹏╥)',
      done: 'Transfer done! 💸\nYou sent {amount} coins to {number}.\nYour balance now: {senderBalance} coins\nReceiver balance now: {receiverBalance} coins\n\n{mood}',
      btnProfile: 'My Profile',
      btnMenu: 'User Menu',
    },
  },
}

export const test = { input: '.transfer', expect: /transfer/i }

export async function handler(ctx) {
  const rawNumber = String(ctx.args[0] ?? '').replace(/\D/g, '')
  const amount = Number(ctx.args[1])
  if (!ctx.args[0] || ctx.args[1] === undefined) return ctx.reply(ctx.t('transfer.usage'))
  if (!/^\d{9,15}$/.test(rawNumber)) return ctx.reply(ctx.t('transfer.badNumber'))
  if (rawNumber === ctx.senderDigits) return ctx.reply(ctx.t('transfer.self'))
  if (!Number.isInteger(amount) || amount < 100) return ctx.reply(ctx.t('transfer.badAmount'))
  const sender = await getProfile(ctx.storage, ctx.senderDigits)
  const senderBalance = sender.balance || 0
  if (senderBalance < amount) return ctx.reply(ctx.t('transfer.noBalance', { balance: senderBalance, amount }))
  const receiver = await getProfile(ctx.storage, rawNumber)
  const updatedSender = await updateProfile(ctx.storage, ctx.senderDigits, { balance: senderBalance - amount })
  const updatedReceiver = await updateProfile(ctx.storage, rawNumber, { balance: (receiver.balance || 0) + amount })
  const body = ctx.t('transfer.done', {
    amount,
    number: rawNumber,
    senderBalance: updatedSender.balance,
    receiverBalance: updatedReceiver.balance,
    mood: ctx.say('sukses'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('transfer.btnProfile'), id: '.profil' },
      { text: ctx.t('transfer.btnMenu'), id: '.menu user' },
    ],
    textFallback: body,
  })
}
