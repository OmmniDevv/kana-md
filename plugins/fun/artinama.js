import { sendButtons } from '../../src/ui/buttons.js'
import { getArtiNama } from '../../src/scrapers/search/primbon.js'

// Arti nama primbon: data asli dari API primbon Siputzx (arti + catatan),
// sama seperti padanan Elaina-MD. Tidak ada lagi sifat karangan dari hash.
export const config = {
  name: 'artinama',
  alias: ['namameaning', 'artinamaku'],
  category: 'fun',
  description: { id: 'Cek arti nama menurut data primbon', en: 'Check a name meaning from primbon data' },
  usage: '.artinama <nama>',
  example: '.artinama Budi',
  cooldown: 5,
}

export const i18n = {
  id: {
    artinama: {
      usage: '╭─❏ 🔤 「 *ARTI NAMA* 」\n┊ Tulis namanya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.artinama Budi*\n╰━━━━━━━',
      title: 'Arti Nama Primbon',
      result: '╭─❏ 🔤 「 *ARTI NAMA PRIMBON* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊\n┊ {arti}\n┊\n┊ _{note}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *ARTI NAMA GAGAL* 」\n┊ Mouu, sumber data primbonnya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Nama Lain',
    },
  },
  en: {
    artinama: {
      usage: '╭─❏ 🔤 「 *NAME MEANING* 」\n┊ Write a name first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.artinama Budi*\n╰━━━━━━━',
      title: 'Primbon Name Meaning',
      result: '╭─❏ 🔤 「 *PRIMBON NAME MEANING* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊\n┊ {arti}\n┊\n┊ _{note}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *NAME MEANING FAILED* 」\n┊ Mouu, the primbon data source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Name',
    },
  },
}

export const test = { input: '.artinama Budi', expect: /arti nama primbon|primbon name meaning/i }

export function formatArtiNama(t, data) {
  return t('artinama.result', { name: data.nama, arti: data.arti, note: data.catatan })
}

export async function handler(ctx) {
  const name = (ctx.text || '').trim().slice(0, 60)
  if (!name) return ctx.reply(ctx.t('artinama.usage'))
  let data
  try {
    data = await getArtiNama(name)
  } catch (err) {
    return ctx.reply(ctx.t('artinama.fail', { message: err.message }))
  }
  const body = formatArtiNama(ctx.t, data)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('artinama.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('artinama.btnAgain'), id: '.artinama' }],
    textFallback: body,
  })
}
