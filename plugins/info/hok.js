import { HOK_HEROES, searchDataset } from '../../src/data/kindb-games.js'

export const config = {
  name: 'hok',
  alias: [],
  category: 'info',
  description: { id: 'Informasi hero Honor of Kings dari dataset lokal kurasi: daftar hero dan rolenya, bisa difilter nama atau role', en: 'Honor of Kings hero info from a curated local dataset: hero list and roles, filterable by name or role' },
  usage: '.hok [nama hero atau role]',
  example: '.hok daji',
  cooldown: 5,
}

export const i18n = {
  id: {
    hok: {
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, *{q}* tidak ada di dataset hero HoK~\n╰━━━━━━━',
      title: '╭─❏ 👑 「 *HERO HONOR OF KINGS* 」\n{list}\n┊ ᴛᴏᴛᴀʟ ᴅɪᴛᴀᴍᴘɪʟᴋᴀɴ: *{count} hero* (dataset lokal kurasi)\n╰━━━━━━━',
      line: '┊ *{name}* - {role}',
    },
  },
  en: {
    hok: {
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, *{q}* is not in the HoK hero dataset~\n╰━━━━━━━',
      title: '╭─❏ 👑 「 *HONOR OF KINGS HEROES* 」\n{list}\n┊ ꜱʜᴏᴡɪɴɢ: *{count} heroes* (curated local dataset)\n╰━━━━━━━',
      line: '┊ *{name}* - {role}',
    },
  },
}

export const test = { input: '.hok daji', expect: /Daji/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  const rows = searchDataset(HOK_HEROES, q)
  if (!rows.length) return ctx.reply(ctx.t('hok.notfound', { q }))
  const list = rows.map(([name, role]) => ctx.t('hok.line', { name, role })).join('\n')
  return ctx.reply(ctx.t('hok.title', { list, count: rows.length }))
}
