import { sendButtons } from '../../src/ui/buttons.js'
import { listSewa, remainingText } from '../../src/services/premium.js'
import { formatWibDateTime } from '../../src/ui/format.js'

export const config = {
  name: 'listsewa',
  alias: ['listrent', 'sewalist'],
  category: 'owner',
  description: { id: 'Lihat daftar sewa bot yang terdaftar', en: 'See the list of registered bot rentals' },
  usage: '.listsewa',
  example: '.listsewa',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    listsewa: {
      empty: '╭─❏ 🏠 「 *DAFTAR SEWA BOT* 」\n┊ Belum ada sewa yang terdaftar nih, Master~\n┊ Tambah pakai *.addsewa* yaa\n╰━━━━━━━',
      header: '╭─❏ 🏠 「 *DAFTAR SEWA BOT* 」\n┊ Total: *{count}* sewa\n{lines}\n╰━━━━━━━',
      lineActivePermanent: '┊ {index}. *{target}* ({type}) : ᴀᴋᴛɪꜰ ᴘᴇʀᴍᴀɴᴇɴ 💎',
      lineActive: '┊ {index}. *{target}* ({type}) : ᴀᴋᴛɪꜰ s/d *{date}* (sisa {left})',
      lineExpired: '┊ {index}. *{target}* ({type}) : ʙᴇʀᴀᴋʜɪʀ *{date}*',
      typeGroup: 'grup',
      typeJadibot: 'jadibot',
      btnAdd: 'Tambah Sewa',
    },
  },
  en: {
    listsewa: {
      empty: '╭─❏ 🏠 「 *BOT RENTAL LIST* 」\n┊ No rentals registered yet, Master~\n┊ Add one with *.addsewa*\n╰━━━━━━━',
      header: '╭─❏ 🏠 「 *BOT RENTAL LIST* 」\n┊ Total: *{count}* rentals\n{lines}\n╰━━━━━━━',
      lineActivePermanent: '┊ {index}. *{target}* ({type}) : ᴀᴄᴛɪᴠᴇ ᴘᴇʀᴍᴀɴᴇɴᴛ 💎',
      lineActive: '┊ {index}. *{target}* ({type}) : ᴀᴄᴛɪᴠᴇ until *{date}* ({left} left)',
      lineExpired: '┊ {index}. *{target}* ({type}) : ᴇxᴘɪʀᴇᴅ *{date}*',
      typeGroup: 'group',
      typeJadibot: 'jadibot',
      btnAdd: 'Add Rental',
    },
  },
}

export const test = { input: '.listsewa', expect: /sewa|rent/i }

export async function handler(ctx) {
  const rows = await listSewa(ctx.storage)
  if (!rows.length) return ctx.reply(ctx.t('listsewa.empty'))
  const lines = rows.map((row, i) => {
    const vars = {
      index: i + 1,
      target: row.key,
      type: ctx.t(row.record?.type === 'jadibot' ? 'listsewa.typeJadibot' : 'listsewa.typeGroup'),
    }
    if (row.active && row.permanent) return ctx.t('listsewa.lineActivePermanent', vars)
    if (row.active) {
      return ctx.t('listsewa.lineActive', {
        ...vars,
        date: formatWibDateTime(new Date(row.expiresAt), ctx.lang),
        left: remainingText(row.expiresAt - Date.now(), ctx.lang),
      })
    }
    return ctx.t('listsewa.lineExpired', {
      ...vars,
      date: row.expiresAt ? formatWibDateTime(new Date(row.expiresAt), ctx.lang) : '-',
    })
  })
  const body = ctx.t('listsewa.header', { count: rows.length, lines: lines.join('\n') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('listsewa.btnAdd'), id: '.addsewa' }],
    textFallback: body,
  })
}
