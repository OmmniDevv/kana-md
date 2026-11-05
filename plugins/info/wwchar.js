import { WUWA_RESONATORS, searchDataset } from '../../src/data/kindb-games.js'

export const config = {
  name: 'wwchar',
  alias: ['wuwa'],
  category: 'info',
  description: { id: 'Informasi karakter (Resonator) Wuthering Waves dari dataset lokal kurasi: elemen dan jenis senjatanya. Nama lama .wuwa ikut ke sini', en: 'Wuthering Waves character (Resonator) info from a curated local dataset: element and weapon type. The old .wuwa name routes here' },
  usage: '.wwchar [nama, elemen, atau senjata]',
  example: '.wwchar jiyan',
  cooldown: 5,
}

export const i18n = {
  id: {
    wwchar: {
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, *{q}* tidak ada di dataset Resonator~\n╰━━━━━━━',
      title: '╭─❏ 🌊 「 *RESONATOR WUTHERING WAVES* 」\n{list}\n┊ ᴛᴏᴛᴀʟ ᴅɪᴛᴀᴍᴘɪʟᴋᴀɴ: *{count} karakter* (dataset lokal kurasi)\n╰━━━━━━━',
      line: '┊ *{name}* - {element} / {weapon}',
    },
  },
  en: {
    wwchar: {
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, *{q}* is not in the Resonator dataset~\n╰━━━━━━━',
      title: '╭─❏ 🌊 「 *WUTHERING WAVES RESONATORS* 」\n{list}\n┊ ꜱʜᴏᴡɪɴɢ: *{count} characters* (curated local dataset)\n╰━━━━━━━',
      line: '┊ *{name}* - {element} / {weapon}',
    },
  },
}

export const test = { input: '.wwchar jiyan', expect: /Jiyan|Aero/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  const rows = searchDataset(WUWA_RESONATORS, q)
  if (!rows.length) return ctx.reply(ctx.t('wwchar.notfound', { q }))
  const list = rows.map(([name, element, weapon]) => ctx.t('wwchar.line', { name, element, weapon })).join('\n')
  return ctx.reply(ctx.t('wwchar.title', { list, count: rows.length }))
}
