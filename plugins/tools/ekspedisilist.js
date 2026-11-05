import { EXPEDITIONS } from '../../src/data/kindb-local.js'

export const config = {
  name: 'ekspedisilist',
  alias: [],
  category: 'tools',
  description: { id: 'Daftar ekspedisi pengiriman di Indonesia dari dataset lokal: layanan dan ciri khas tiap kurir', en: 'List of Indonesian couriers from a local dataset: services and traits of each courier' },
  usage: '.ekspedisilist [nama ekspedisi]',
  example: '.ekspedisilist jne',
  cooldown: 5,
}

export const i18n = {
  id: {
    ekspedisilist: {
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, ekspedisi *{q}* tidak ada di dataset~\n┊ Coba: JNE, J&T, SiCepat, AnterAja, Pos Indonesia~\n╰━━━━━━━',
      title: '╭─❏ 🚚 「 *DAFTAR EKSPEDISI* 」\n{list}\n┊ ꜱᴜᴍʙᴇʀ: dataset lokal KANA\n╰━━━━━━━',
      item: '┊ *{name}*\n┊ ʟᴀʏᴀɴᴀɴ: {services}\n┊ {note}',
    },
  },
  en: {
    ekspedisilist: {
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, courier *{q}* is not in the dataset~\n┊ Try: JNE, J&T, SiCepat, AnterAja, Pos Indonesia~\n╰━━━━━━━',
      title: '╭─❏ 🚚 「 *COURIER LIST* 」\n{list}\n┊ ꜱᴏᴜʀᴄᴇ: KANA local dataset\n╰━━━━━━━',
      item: '┊ *{name}*\n┊ ꜱᴇʀᴠɪᴄᴇꜱ: {services}\n┊ {note}',
    },
  },
}

export const test = { input: '.ekspedisilist jne', expect: /JNE|SiCepat/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim().toLowerCase()
  const rows = q ? EXPEDITIONS.filter((e) => e.name.toLowerCase().includes(q)) : EXPEDITIONS
  if (!rows.length) return ctx.reply(ctx.t('ekspedisilist.notfound', { q }))
  const list = rows.map((e) => ctx.t('ekspedisilist.item', e)).join('\n')
  return ctx.reply(ctx.t('ekspedisilist.title', { list }))
}
