import { sendButtons } from '../../src/ui/buttons.js'
import { bankDeposit, bankWithdraw } from '../../src/rpg/engine.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'bank',
  alias: [],
  category: 'rpg',
  description: { id: 'Bank RPG: simpan dan ambil koin dengan aman', en: 'RPG bank: deposit and withdraw coins safely' },
  usage: '.bank | .bank simpan <jumlah|all> | .bank ambil <jumlah|all>',
  example: '.bank simpan 500',
  cooldown: 3,
}

export const i18n = {
  id: {
    bank: {
      status: '🏦 BANK KANA 🏦\nKoin di dompet: {balance} 💰\nSaldo bank: {bank} 🏦\n\nSimpan: .bank simpan <jumlah>\nAmbil: .bank ambil <jumlah>\nKetik all buat semua yaa~',
      deposited: '🏦 Berhasil simpan {amount} koin!\nDompet: {balance} | Bank: {bank}\n{mood}',
      withdrawn: '🏦 Berhasil ambil {amount} koin!\nDompet: {balance} | Bank: {bank}\n{mood}',
      noCoins: 'Mouu, koin di dompet kamu kurang buat simpan segitu 🥺',
      noBank: 'Mouu, saldo bank kamu kurang buat ambil segitu 🥺',
      invalid: 'Jumlahnya yang bener dong~ contoh .bank simpan 500 atau .bank simpan all',
      btnDeposit: 'Simpan 100',
      btnWithdraw: 'Ambil 100',
      btnProfile: 'Profil RPG',
    },
  },
  en: {
    bank: {
      status: '🏦 KANA BANK 🏦\nCoins in wallet: {balance} 💰\nBank balance: {bank} 🏦\n\nDeposit: .bank simpan <amount>\nWithdraw: .bank ambil <amount>\nType all for everything~',
      deposited: '🏦 Deposited {amount} coins!\nWallet: {balance} | Bank: {bank}\n{mood}',
      withdrawn: '🏦 Withdrew {amount} coins!\nWallet: {balance} | Bank: {bank}\n{mood}',
      noCoins: 'Mouu, your wallet coins are not enough to deposit that much 🥺',
      noBank: 'Mouu, your bank balance is not enough to withdraw that much 🥺',
      invalid: 'Give a proper amount please~ e.g. .bank simpan 500 or .bank simpan all',
      btnDeposit: 'Deposit 100',
      btnWithdraw: 'Withdraw 100',
      btnProfile: 'RPG Profile',
    },
  },
}

export async function handler(ctx) {
  const args = ctx.args ?? []
  const replies = [
    { text: ctx.t('bank.btnDeposit'), id: '.bank simpan 100' },
    { text: ctx.t('bank.btnWithdraw'), id: '.bank ambil 100' },
    { text: ctx.t('bank.btnProfile'), id: '.rpg' },
  ]
  const send = (body) =>
    sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  const action = (args[0] || '').toLowerCase()
  const rawAmount = (args[1] || '').toLowerCase()
  const amount = rawAmount === 'all' ? 'all' : parseInt(rawAmount, 10)
  if (['simpan', 'deposit', 'nabung'].includes(action)) {
    if (rawAmount !== 'all' && !(amount > 0)) return send(ctx.t('bank.invalid'))
    const res = await bankDeposit(ctx.storage, ctx.senderDigits, amount)
    if (res.ok) return send(ctx.t('bank.deposited', { amount: res.amount, balance: res.balance, bank: res.bank, mood: ctx.say('senang') }))
    return send(ctx.t('bank.noCoins'))
  }
  if (['ambil', 'withdraw', 'tarik'].includes(action)) {
    if (rawAmount !== 'all' && !(amount > 0)) return send(ctx.t('bank.invalid'))
    const res = await bankWithdraw(ctx.storage, ctx.senderDigits, amount)
    if (res.ok) return send(ctx.t('bank.withdrawn', { amount: res.amount, balance: res.balance, bank: res.bank, mood: ctx.say('senang') }))
    return send(ctx.t('bank.noBank'))
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  return send(ctx.t('bank.status', { balance: profile.balance ?? 0, bank: profile.bank ?? 0 }))
}
