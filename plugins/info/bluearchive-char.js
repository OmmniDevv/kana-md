import { BA_STUDENTS, searchDataset } from '../../src/data/kindb-games.js'

export const config = {
  name: 'bluearchive-char',
  alias: [],
  category: 'info',
  description: { id: 'Daftar karakter (murid) Blue Archive dan akademinya dari dataset lokal kurasi, bisa difilter nama atau akademi', en: 'Blue Archive character (student) list and their academies from a curated local dataset, filterable by name or academy' },
  usage: '.bluearchive-char [nama atau akademi]',
  example: '.bluearchive-char shiroko',
  cooldown: 5,
}

export const i18n = {
  id: {
    'bluearchive-char': {
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, *{q}* tidak ada di dataset murid Blue Archive~\n╰━━━━━━━',
      title: '╭─❏ 🎀 「 *MURID BLUE ARCHIVE* 」\n{list}\n┊ ᴛᴏᴛᴀʟ ᴅɪᴛᴀᴍᴘɪʟᴋᴀɴ: *{count} murid* (dataset lokal kurasi)\n╰━━━━━━━',
      line: '┊ *{name}* - {school}',
    },
  },
  en: {
    'bluearchive-char': {
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, *{q}* is not in the Blue Archive student dataset~\n╰━━━━━━━',
      title: '╭─❏ 🎀 「 *BLUE ARCHIVE STUDENTS* 」\n{list}\n┊ ꜱʜᴏᴡɪɴɢ: *{count} students* (curated local dataset)\n╰━━━━━━━',
      line: '┊ *{name}* - {school}',
    },
  },
}

export const test = { input: '.bluearchive-char shiroko', expect: /Shiroko|Abydos/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  const rows = searchDataset(BA_STUDENTS, q)
  if (!rows.length) return ctx.reply(ctx.t('bluearchive-char.notfound', { q }))
  const list = rows.map(([name, school]) => ctx.t('bluearchive-char.line', { name, school })).join('\n')
  return ctx.reply(ctx.t('bluearchive-char.title', { list, count: rows.length }))
}
