import { sendButtons } from '../../src/ui/buttons.js'
import { updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'unban',
  alias: [],
  category: 'owner',
  description: { id: 'Cabut ban satu nomor', en: 'Lift the ban of one number' },
  usage: '.unban <nomor>',
  example: '.unban 6281234567890',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    unban: {
      hint: '╭─❏ ✅ 「 *CABUT BAN* 」\n┊ Sebutin nomornya dulu yaa, Master.\n┊ ᴄᴏɴᴛᴏʜ: *.unban 6281234567890*, atau mention orangnya~\n╰━━━━━━━',
      done: '╭─❏ ✅ 「 *BAN DICABUT* 」\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ Siap, Master~ ban nomor itu udah KANA cabut. {mood}\n╰━━━━━━━',
      btnBan: 'Ban Lagi',
      btnOwner: 'Status Bot',
    },
  },
  en: {
    unban: {
      hint: '╭─❏ ✅ 「 *LIFT BAN* 」\n┊ Give the number first, Master.\n┊ ᴇxᴀᴍᴘʟᴇ: *.unban 6281234567890*, or mention the person~\n╰━━━━━━━',
      done: '╭─❏ ✅ 「 *BAN LIFTED* 」\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ Got it, Master~ the ban on that number is lifted. {mood}\n╰━━━━━━━',
      btnBan: 'Ban Again',
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

export const test = { input: '.unban', expect: /nomor/i }

export async function handler(ctx) {
  const digits = targetDigits(ctx)
  if (!digits) return ctx.reply(ctx.t('unban.hint'))
  await updateProfile(ctx.storage, digits, { banned: false })
  const body = ctx.t('unban.done', { number: digits, mood: ctx.say('sukses') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('unban.btnBan'), id: `.ban ${digits}` },
      { text: ctx.t('unban.btnOwner'), id: '.owner' },
    ],
    textFallback: body,
  })
}
