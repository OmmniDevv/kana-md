import { sendButtons } from '../../src/ui/buttons.js'
import { updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'ban',
  alias: ['banchat'],
  category: 'owner',
  description: { id: 'Ban satu nomor dari memakai bot', en: 'Ban one number from using the bot' },
  usage: '.ban <nomor>',
  example: '.ban 6281234567890',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    ban: {
      hint: '╭─❏ 🚫 「 *BAN PENGGUNA* 」\n┊ Sebutin nomornya dulu yaa, Master.\n┊ ᴄᴏɴᴛᴏʜ: *.ban 6281234567890*, atau mention orangnya~\n╰━━━━━━━',
      done: '╭─❏ 🚫 「 *BAN BERHASIL* 」\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ Siap, Master~ nomor itu udah KANA ban. {mood}\n╰━━━━━━━',
      btnUnban: 'Cabut Ban',
      btnOwner: 'Status Bot',
    },
  },
  en: {
    ban: {
      hint: '╭─❏ 🚫 「 *BAN USER* 」\n┊ Give the number first, Master.\n┊ ᴇxᴀᴍᴘʟᴇ: *.ban 6281234567890*, or mention the person~\n╰━━━━━━━',
      done: '╭─❏ 🚫 「 *BAN SUCCESSFUL* 」\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ Got it, Master~ that number is banned. {mood}\n╰━━━━━━━',
      btnUnban: 'Lift Ban',
      btnOwner: 'Bot Status',
    },
  },
}

function targetDigits(ctx) {
  if (ctx.mentionedJids?.length) {
    const d = String(ctx.mentionedJids[0]).replace(/\D/g, '')
    if (d.length >= 9 && d.length <= 15) return d
  }
  const d = (ctx.text || '').replace(/\D/g, '')
  return d.length >= 9 && d.length <= 15 ? d : ''
}

export const test = { input: '.ban', expect: /nomor/i }

export async function handler(ctx) {
  const digits = targetDigits(ctx)
  if (!digits) return ctx.reply(ctx.t('ban.hint'))
  await updateProfile(ctx.storage, digits, { banned: true })
  const body = ctx.t('ban.done', { number: digits, mood: ctx.say('sukses') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('ban.btnUnban'), id: `.unban ${digits}` },
      { text: ctx.t('ban.btnOwner'), id: '.owner' },
    ],
    textFallback: body,
  })
}
