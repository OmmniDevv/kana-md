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
      usage: '╭─❏ 💸 「 *TRANSFER KOIN* 」\n┊ Formatnya: *.transfer <nomor tujuan> <jumlah>*\n┊ Contoh: *.transfer 628123456789 500*\n┊ Minimal *100 koin* yaa~\n╰━━━━━━━',
      badNumber: '╭─❏ ⚠️ 「 *NOMOR TIDAK VALID* 」\n┊ Nomor tujuannya harus 9 sampai 15 digit angka yaa~\n╰━━━━━━━',
      self: '╭─❏ 🙈 「 *ITU NOMORMU SENDIRI* 」\n┊ Ehh, nggak bisa transfer ke diri sendiri dong (≧▽≦)\n┊ Pilih nomor lain yaa~\n╰━━━━━━━',
      badAmount: '╭─❏ ⚠️ 「 *JUMLAH TIDAK VALID* 」\n┊ Jumlahnya harus angka bulat minimal *100 koin* yaa~\n╰━━━━━━━',
      noBalance: '╭─❏ 🌸 「 *SALDO KURANG* 」\n┊ Mouu, saldo kamu kurang.\n┊ ꜱᴀʟᴅᴏ ᴋᴀᴍᴜ: *{balance} koin*\n┊ ᴍᴀᴜ ᴋɪʀɪᴍ: *{amount} koin* (╥﹏╥)\n╰━━━━━━━',
      done: '╭─❏ 💸 「 *TRANSFER BERES* 」\n┊ ᴋᴀᴍᴜ ᴋɪʀɪᴍ: *{amount} koin*\n┊ ᴋᴇ: *{number}*\n┊ ꜱᴀʟᴅᴏ ᴋᴀᴍᴜ: *{senderBalance} koin*\n┊ ꜱᴀʟᴅᴏ ᴘᴇɴᴇʀɪᴍᴀ: *{receiverBalance} koin*\n╰━━━━━━━\n{mood}',
      btnProfile: 'Profil Aku',
    },
  },
  en: {
    transfer: {
      usage: '╭─❏ 💸 「 *TRANSFER COINS* 」\n┊ Format: *.transfer <destination number> <amount>*\n┊ Example: *.transfer 628123456789 500*\n┊ Minimum *100 coins*~\n╰━━━━━━━',
      badNumber: '╭─❏ ⚠️ 「 *INVALID NUMBER* 」\n┊ The destination number must be 9 to 15 digits~\n╰━━━━━━━',
      self: '╭─❏ 🙈 「 *THAT IS YOUR OWN NUMBER* 」\n┊ Eh, you cannot transfer to yourself (≧▽≦)\n┊ Pick another number~\n╰━━━━━━━',
      badAmount: '╭─❏ ⚠️ 「 *INVALID AMOUNT* 」\n┊ The amount must be a whole number of at least *100 coins*~\n╰━━━━━━━',
      noBalance: '╭─❏ 🌸 「 *NOT ENOUGH BALANCE* 」\n┊ Mouu, your balance is not enough.\n┊ ʏᴏᴜʀ ʙᴀʟᴀɴᴄᴇ: *{balance} coins*\n┊ ᴛʀɪᴇᴅ ᴛᴏ ꜱᴇɴᴅ: *{amount} coins* (╥﹏╥)\n╰━━━━━━━',
      done: '╭─❏ 💸 「 *TRANSFER DONE* 」\n┊ ʏᴏᴜ ꜱᴇɴᴛ: *{amount} coins*\n┊ ᴛᴏ: *{number}*\n┊ ʏᴏᴜʀ ʙᴀʟᴀɴᴄᴇ: *{senderBalance} coins*\n┊ ʀᴇᴄᴇɪᴠᴇʀ ʙᴀʟᴀɴᴄᴇ: *{receiverBalance} coins*\n╰━━━━━━━\n{mood}',
      btnProfile: 'My Profile',
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
    replies: [{ text: ctx.t('transfer.btnProfile'), id: '.profil' }],
    textFallback: body,
  })
}
