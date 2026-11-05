import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendAudio } from '../../src/ui/media.js'

// Cari dan putar efek suara meme dari MyInstants (myinstants.com,
// publik tanpa kunci). Terverifikasi 2026-11-05: halaman pencarian
// memuat daftar instant dengan judul dan berkas mp3.
export const config = {
  name: 'soundmeme2',
  alias: ['meme2', 'soundeffect'],
  category: 'search',
  description: { id: 'Cari dan putar efek suara meme (MyInstants)', en: 'Search and play meme sound effects (MyInstants)' },
  usage: '.soundmeme2 <kata kunci>',
  example: '.soundmeme2 bruh',
  cooldown: 10,
  limit: 5,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    soundmeme2: {
      needQuery: '╭─❏ 🔊 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.soundmeme2 bruh*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SUARA TIDAK KETEMU* 」\n┊ Mouu, efek suara itu nggak ketemu di MyInstants~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL PUTAR* 」\n┊ Mouu, gagal putar efek suaranya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🔊 「 *SOUND MEME* 」\n┊ 🎵 *{title}*\n┊ 🔗 https://www.myinstants.com\n╰━━━━━━━',
    },
  },
  en: {
    soundmeme2: {
      needQuery: '╭─❏ 🔊 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.soundmeme2 bruh*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SOUND NOT FOUND* 」\n┊ Mouu, that sound effect was not found on MyInstants~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO PLAY* 」\n┊ Mouu, failed to play the sound effect: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🔊 「 *SOUND MEME* 」\n┊ 🎵 *{title}*\n┊ 🔗 https://www.myinstants.com\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.soundmeme2 bruh', expect: /SOUND MEME|bruh/i }

// Urai halaman pencarian MyInstants menjadi daftar { title, path }.
export function parseInstants(html, limit = 5) {
  const out = []
  const re = /play\('(\/media\/sounds\/[^']+\.mp3)',\s*'[^']*',\s*'([^']+)'\)/g
  for (const m of String(html || '').matchAll(re)) {
    out.push({ path: m[1], title: m[2].replace(/\\'/g, "'") })
    if (out.length >= limit) break
  }
  return out
}

async function searchInstants(query) {
  const res = await fetch(`https://www.myinstants.com/en/search/?name=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`MyInstants HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { search = searchInstants } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('soundmeme2.needQuery'))
  let items
  try {
    items = parseInstants(await search(q))
  } catch (err) {
    return ctx.reply(ctx.t('soundmeme2.failed', { message: err.message }))
  }
  if (!items.length) return ctx.reply(ctx.t('soundmeme2.notFound'))
  const first = items[0]
  try {
    const { buffer } = await downloadBuffer(`https://www.myinstants.com${first.path}`, { maxBytes: 16 * 1024 * 1024, timeout: 30000 })
    await sendAudio(ctx, buffer, { title: first.title, mimetype: 'audio/mpeg' })
    return ctx.reply(ctx.t('soundmeme2.caption', { title: first.title }))
  } catch (err) {
    return ctx.reply(ctx.t('soundmeme2.failed', { message: err.message }))
  }
}
