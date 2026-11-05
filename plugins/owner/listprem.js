import { sendButtons } from '../../src/ui/buttons.js'
import { listPremium, remainingText } from '../../src/services/premium.js'
import { formatWibDateTime } from '../../src/ui/format.js'

export const config = {
  name: 'listprem',
  alias: ['listpremium', 'premiums'],
  category: 'owner',
  description: { id: 'Lihat daftar pengguna premium', en: 'See the list of premium users' },
  usage: '.listprem',
  example: '.listprem',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    listprem: {
      empty: '╭─❏ 💎 「 *DAFTAR PREMIUM* 」\n┊ Belum ada pengguna premium nih, Master~\n┊ Tambah pakai *.addprem <nomor> <durasi>* yaa\n╰━━━━━━━',
      header: '╭─❏ 💎 「 *DAFTAR PREMIUM* 」\n┊ Total: *{count}* nomor\n{lines}\n╰━━━━━━━',
      lineActivePermanent: '┊ {index}. *{number}* : ᴀᴋᴛɪꜰ ᴘᴇʀᴍᴀɴᴇɴ 💎',
      lineActive: '┊ {index}. *{number}* : ᴀᴋᴛɪꜰ s/d *{date}* (sisa {left})',
      lineExpired: '┊ {index}. *{number}* : ʙᴇʀᴀᴋʜɪʀ *{date}*',
      btnAdd: 'Tambah Premium',
    },
  },
  en: {
    listprem: {
      empty: '╭─❏ 💎 「 *PREMIUM LIST* 」\n┊ No premium users yet, Master~\n┊ Add one with *.addprem <number> <duration>*\n╰━━━━━━━',
      header: '╭─❏ 💎 「 *PREMIUM LIST* 」\n┊ Total: *{count}* numbers\n{lines}\n╰━━━━━━━',
      lineActivePermanent: '┊ {index}. *{number}* : ᴀᴄᴛɪᴠᴇ ᴘᴇʀᴍᴀɴᴇɴᴛ 💎',
      lineActive: '┊ {index}. *{number}* : ᴀᴄᴛɪᴠᴇ until *{date}* ({left} left)',
      lineExpired: '┊ {index}. *{number}* : ᴇxᴘɪʀᴇᴅ *{date}*',
      btnAdd: 'Add Premium',
    },
  },
}

export const test = { input: '.listprem', expect: /premium/i }

export async function handler(ctx) {
  const rows = await listPremium(ctx.storage)
  if (!rows.length) return ctx.reply(ctx.t('listprem.empty'))
  const lines = rows.map((row, i) => {
    if (row.active && row.permanent) {
      return ctx.t('listprem.lineActivePermanent', { index: i + 1, number: row.digits })
    }
    if (row.active) {
      return ctx.t('listprem.lineActive', {
        index: i + 1,
        number: row.digits,
        date: formatWibDateTime(new Date(row.expiresAt), ctx.lang),
        left: remainingText(row.expiresAt - Date.now(), ctx.lang),
      })
    }
    return ctx.t('listprem.lineExpired', {
      index: i + 1,
      number: row.digits,
      date: row.expiresAt ? formatWibDateTime(new Date(row.expiresAt), ctx.lang) : '-',
    })
  })
  const body = ctx.t('listprem.header', { count: rows.length, lines: lines.join('\n') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('listprem.btnAdd'), id: '.addprem' }],
    textFallback: body,
  })
}
