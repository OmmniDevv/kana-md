import { CALLING_CODES, findCallingCode } from '../../src/data/kindb-local.js'

export const config = {
  name: 'callingcode',
  alias: [],
  category: 'info',
  description: { id: 'Kode telepon negara dari dataset lokal (70 negara): cari berdasarkan nama negara atau kode', en: 'Country calling codes from a local dataset (70 countries): search by country name or code' },
  usage: '.callingcode <negara atau kode>',
  example: '.callingcode jepang',
  cooldown: 5,
}

export const i18n = {
  id: {
    callingcode: {
      hint: '╭─❏ ☎️ 「 *KODE TELEPON* 」\n┊ Tulis nama negara atau kodenya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.callingcode jepang* atau *.callingcode 81*\n┊ ᴅᴀᴛᴀꜱᴇᴛ ʟᴏᴋᴀʟ: *{total} negara*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, *{q}* tidak ada di dataset kode telepon~\n┊ Coba nama negara bahasa Indonesia atau kodenya yaa~\n╰━━━━━━━',
      title: '╭─❏ ☎️ 「 *KODE TELEPON: {q}* 」\n{list}\n┊ ꜱᴜᴍʙᴇʀ: dataset lokal KANA ({total} negara)\n╰━━━━━━━',
      line: '┊ {name}: *+{code}*',
    },
  },
  en: {
    callingcode: {
      hint: '╭─❏ ☎️ 「 *CALLING CODES* 」\n┊ Write a country name or a code~\n┊ ᴇxᴀᴍᴘʟᴇ: *.callingcode jepang* or *.callingcode 81*\n┊ ʟᴏᴄᴀʟ ᴅᴀᴛᴀꜱᴇᴛ: *{total} countries*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, *{q}* is not in the calling code dataset~\n┊ Try the Indonesian country name or the code itself~\n╰━━━━━━━',
      title: '╭─❏ ☎️ 「 *CALLING CODE: {q}* 」\n{list}\n┊ ꜱᴏᴜʀᴄᴇ: KANA local dataset ({total} countries)\n╰━━━━━━━',
      line: '┊ {name}: *+{code}*',
    },
  },
}

export const test = { input: '.callingcode jepang', expect: /Jepang|\+81/ }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('callingcode.hint', { total: CALLING_CODES.length }))
  const rows = findCallingCode(q)
  if (!rows.length) return ctx.reply(ctx.t('callingcode.notfound', { q }))
  const list = rows.map((r) => ctx.t('callingcode.line', r)).join('\n')
  return ctx.reply(ctx.t('callingcode.title', { q, list, total: CALLING_CODES.length }))
}
