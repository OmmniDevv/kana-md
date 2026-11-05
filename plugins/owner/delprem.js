import { sendButtons } from '../../src/ui/buttons.js'
import { removePremium } from '../../src/services/premium.js'

export const config = {
  name: 'delprem',
  alias: ['delpremium', 'removeprem'],
  category: 'owner',
  description: { id: 'Cabut premium satu nomor', en: 'Remove premium from one number' },
  usage: '.delprem <nomor>',
  example: '.delprem 6281234567890',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    delprem: {
      hint: '╭─❏ 💎 「 *CABUT PREMIUM* 」\n┊ Sebutin nomornya dulu yaa, Master.\n┊ ᴄᴏɴᴛᴏʜ: *.delprem 6281234567890*, atau mention orangnya~\n╰━━━━━━━',
      done: '╭─❏ 💎 「 *PREMIUM DICABUT* 」\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ Beres, Master~ nomor itu balik jadi pengguna biasa. {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NGAK ADA PREMIUM* 」\n┊ Nomor *{number}* memang nggak punya premium kok, Master~\n╰━━━━━━━',
      btnList: 'Daftar Premium',
    },
  },
  en: {
    delprem: {
      hint: '╭─❏ 💎 「 *REMOVE PREMIUM* 」\n┊ Give the number first, Master.\n┊ ᴇxᴀᴍᴘʟᴇ: *.delprem 6281234567890*, or mention the person~\n╰━━━━━━━',
      done: '╭─❏ 💎 「 *PREMIUM REMOVED* 」\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ Done, Master~ that number is back to a regular user. {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO PREMIUM FOUND* 」\n┊ Number *{number}* does not have premium anyway, Master~\n╰━━━━━━━',
      btnList: 'Premium List',
    },
  },
}

function targetDigits(ctx) {
  if (ctx.mentionedJids?.length) {
    const d = String(ctx.mentionedJids[0]).replace(/\D/g, '')
    if (d.length >= 9 && d.length <= 15) return d
  }
  if (ctx.quoted?.sender) {
    const d = String(ctx.quoted.sender).replace(/\D/g, '')
    if (d.length >= 9 && d.length <= 15) return d
  }
  const d = (ctx.text || '').replace(/\D/g, '')
  return d.length >= 9 && d.length <= 15 ? d : ''
}

export const test = { input: '.delprem', expect: /premium/i }

export async function handler(ctx) {
  const digits = targetDigits(ctx)
  if (!digits) return ctx.reply(ctx.t('delprem.hint'))
  const removed = await removePremium(ctx.storage, digits)
  const body = ctx.t(removed ? 'delprem.done' : 'delprem.notFound', {
    number: digits,
    mood: ctx.say('sukses'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('delprem.btnList'), id: '.listprem' }],
    textFallback: body,
  })
}
