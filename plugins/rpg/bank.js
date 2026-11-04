import { sendButtons } from '../../src/ui/buttons.js'
import { bankDeposit, bankWithdraw } from '../../src/rpg/engine.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'bank',
  alias: ['atm', 'nabung', 'tarik', 'atmall'],
  category: 'rpg',
  description: { id: 'Bank RPG: simpan dan ambil koin dengan aman', en: 'RPG bank: deposit and withdraw coins safely' },
  usage: '.bank | .bank simpan <jumlah|all> | .bank ambil <jumlah|all>',
  example: '.bank simpan 500',
  cooldown: 3,
}

export const i18n = {
  id: {
    bank: {
      status: '╭─❏ 🏦 「 *BANK* 」\n┊ 🏦 BANK KANA 🏦\n┊ ᴋᴏɪɴ ᴅɪ ᴅᴏᴍᴘᴇᴛ: {balance} 💰\n┊ ꜱᴀʟᴅᴏ ʙᴀɴᴋ: {bank} 🏦\n\n┊ ꜱɪᴍᴘᴀɴ: .bank simpan <jumlah>\n┊ ᴀᴍʙɪʟ: .bank ambil <jumlah>\n┊ Ketik all buat semua yaa~\n╰━━━━━━━',
      deposited: '╭─❏ 🏦 「 *BANK* 」\n┊ 🏦 Berhasil simpan {amount} koin!\n┊ ᴅᴏᴍᴘᴇᴛ: {balance} | Bank: {bank}\n┊ {mood}\n╰━━━━━━━',
      withdrawn: '╭─❏ 🏦 「 *BANK* 」\n┊ 🏦 Berhasil ambil {amount} koin!\n┊ ᴅᴏᴍᴘᴇᴛ: {balance} | Bank: {bank}\n┊ {mood}\n╰━━━━━━━',
      noCoins: '╭─❏ ✨ 「 *BANK* 」\n┊ Mouu, koin di dompet kamu kurang buat simpan segitu 🥺\n╰━━━━━━━',
      noBank: '╭─❏ ✨ 「 *BANK* 」\n┊ Mouu, saldo bank kamu kurang buat ambil segitu 🥺\n╰━━━━━━━',
      invalid: '╭─❏ ✨ 「 *BANK* 」\n┊ Jumlahnya yang bener dong~ contoh .bank simpan 500 atau .bank simpan all\n╰━━━━━━━',
      btnDeposit: 'Simpan 100',
      btnWithdraw: 'Ambil 100',
      btnProfile: 'Profil RPG',
    },
  },
  en: {
    bank: {
      status: '╭─❏ 🏦 「 *BANK* 」\n┊ 🏦 KANA BANK 🏦\n┊ ᴄᴏɪɴꜱ ɪɴ ᴡᴀʟʟᴇᴛ: {balance} 💰\n┊ ʙᴀɴᴋ ʙᴀʟᴀɴᴄᴇ: {bank} 🏦\n\n┊ ᴅᴇᴘᴏꜱɪᴛ: .bank simpan <amount>\n┊ ᴡɪᴛʜᴅʀᴀᴡ: .bank ambil <amount>\n┊ Type all for everything~\n╰━━━━━━━',
      deposited: '╭─❏ 🏦 「 *BANK* 」\n┊ 🏦 Deposited {amount} coins!\n┊ ᴡᴀʟʟᴇᴛ: {balance} | Bank: {bank}\n┊ {mood}\n╰━━━━━━━',
      withdrawn: '╭─❏ 🏦 「 *BANK* 」\n┊ 🏦 Withdrew {amount} coins!\n┊ ᴡᴀʟʟᴇᴛ: {balance} | Bank: {bank}\n┊ {mood}\n╰━━━━━━━',
      noCoins: '╭─❏ ✨ 「 *BANK* 」\n┊ Mouu, your wallet coins are not enough to deposit that much 🥺\n╰━━━━━━━',
      noBank: '╭─❏ ✨ 「 *BANK* 」\n┊ Mouu, your bank balance is not enough to withdraw that much 🥺\n╰━━━━━━━',
      invalid: '╭─❏ ✨ 「 *BANK* 」\n┊ Give a proper amount please~ e.g. .bank simpan 500 or .bank simpan all\n╰━━━━━━━',
      btnDeposit: 'Deposit 100',
      btnWithdraw: 'Withdraw 100',
      btnProfile: 'RPG Profile',
    },
  },
}

export const test = { input: '.bank', expect: /bank/i }

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
