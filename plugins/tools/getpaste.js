// Ambil isi paste dari tautan dpaste.org atau pastebin.com.
// dpaste dibaca lewat jalur /<id>/raw, pastebin lewat /raw/<id>;
// keduanya terverifikasi dari VM 2026-11-05.
export const config = {
  name: 'getpaste',
  alias: ['readpaste'],
  category: 'tools',
  description: { id: 'Baca isi paste dari link dpaste atau Pastebin', en: 'Read paste content from a dpaste or Pastebin link' },
  usage: '.getpaste <link paste>',
  example: '.getpaste https://dpaste.org/qxy73',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    getpaste: {
      needUrl: '╭─❏ 📋 「 *KIRIM LINK PASTE* 」\n┊ ᴄᴏɴᴛᴏʜ: *.getpaste https://dpaste.org/xxxx*\n┊ ᴅᴜᴋᴜɴɢ ᴅᴘᴀꜱᴛᴇ.ᴏʀɢ ᴅᴀɴ ᴘᴀꜱᴛᴇʙɪɴ.ᴄᴏᴍ.\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PASTE TIDAK KETEMU* 」\n┊ Mouu, paste itu tidak ketemu, mungkin sudah kedaluwarsa~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL BACA PASTE* 」\n┊ Mouu, gagal baca pastenya: *{message}*\n╰━━━━━━━',
      head: '╭─❏ 📋 「 *ISI PASTE* 」\n┊ {url}\n┊ ─────\n',
      more: '\n┊ … (ᴅɪᴘᴏᴛᴏɴɢ, ᴛᴏᴛᴀʟ {total} ᴋᴀʀᴀᴋᴛᴇʀ)',
    },
  },
  en: {
    getpaste: {
      needUrl: '╭─❏ 📋 「 *SEND A PASTE LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.getpaste https://dpaste.org/xxxx*\n┊ ꜱᴜᴘᴘᴏʀᴛꜱ ᴅᴘᴀꜱᴛᴇ.ᴏʀɢ ᴀɴᴅ ᴘᴀꜱᴛᴇʙɪɴ.ᴄᴏᴍ.\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PASTE NOT FOUND* 」\n┊ Mouu, that paste was not found, it may have expired~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO READ PASTE* 」\n┊ Mouu, failed to read the paste: *{message}*\n╰━━━━━━━',
      head: '╭─❏ 📋 「 *PASTE CONTENT* 」\n┊ {url}\n┊ ─────\n',
      more: '\n┊ … (ᴛʀᴜɴᴄᴀᴛᴇᴅ, {total} ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ᴛᴏᴛᴀʟ)',
    },
  },
}

export const test = { input: '.getpaste https://dpaste.org/qxy73', expect: /KANA GETPASTE TES MARKER 77341/ }

// Normalisasi masukan menjadi URL mentah paste, atau null.
export function pasteRawUrl(input) {
  const src = String(input || '').trim()
  const dpaste = src.match(/dpaste\.org\/([A-Za-z0-9]+)/)
  if (dpaste) return `https://dpaste.org/${dpaste[1]}/raw`
  const pastebin = src.match(/pastebin\.com\/(?:raw\/)?([A-Za-z0-9]+)/)
  if (pastebin) return `https://pastebin.com/raw/${pastebin[1]}`
  if (/^[A-Za-z0-9]{6,12}$/.test(src)) return `https://pastebin.com/raw/${src}`
  return null
}

async function fetchRaw(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  if (/Snippet not found|Pastebin\.com - Not Found/i.test(text) && text.length < 6000) return null
  return text
}

export async function handler(ctx, { fetchPaste = fetchRaw } = {}) {
  const url = pasteRawUrl(ctx.text || '')
  if (!url) return ctx.reply(ctx.t('getpaste.needUrl'))
  let content
  try {
    content = await fetchPaste(url)
  } catch (err) {
    return ctx.reply(ctx.t('getpaste.failed', { message: err.message }))
  }
  if (!content) return ctx.reply(ctx.t('getpaste.notFound'))
  const shown = content.slice(0, 3000)
  const tail = content.length > 3000 ? ctx.t('getpaste.more', { total: content.length }) : ''
  return ctx.reply(ctx.t('getpaste.head', { url }) + shown + tail)
}
