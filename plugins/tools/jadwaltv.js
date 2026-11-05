import * as cheerio from 'cheerio'

// Jadwal acara TV Indonesia dari jadwaltv.net: tanpa argumen berarti
// daftar channel; dengan nama channel berarti jadwal hari ini di
// channel itu. Terverifikasi 2026-11-05 halaman utama dan per channel.
export const config = {
  name: 'jadwaltv',
  alias: ['jadwaltivi', 'tvschedule'],
  category: 'tools',
  description: { id: 'Jadwal acara TV Indonesia hari ini per channel', en: 'Indonesian TV schedule for today per channel' },
  usage: '.jadwaltv [nama channel]',
  example: '.jadwaltv rcti',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    jadwaltv: {
      failed: '╭─❏ 😿 「 *GAGAL AMBIL JADWAL* 」\n┊ Mouu, gagal ambil jadwalnya: *{message}*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *CHANNEL TIDAK KETEMU* 」\n┊ Mouu, channel *{q}* tidak ketemu~\n┊ ᴋᴇᴛɪᴋ *.jadwaltv* ᴛᴀɴᴘᴀ ᴀʀɢᴜᴍᴇɴ ʙᴜᴀᴛ ᴅᴀꜰᴛᴀʀ ᴄʜᴀɴɴᴇʟɴʏᴀ.\n╰━━━━━━━',
      listHeader: '╭─❏ 📺 「 *DAFTAR CHANNEL TV* 」\n┊ ᴋᴇᴛɪᴋ *.jadwaltv <nama>* ʙᴜᴀᴛ ᴊᴀᴅᴡᴀʟ ʜᴀʀɪ ɪɴɪ.',
      chanItem: '┊ • {name}',
      listFooter: '╰━━━━━━━',
      schedHeader: '╭─❏ 📺 「 *JADWAL {channel} HARI INI* 」',
      schedItem: '┊ 🕐 {time} WIB: *{show}*',
      schedFooter: '╰━━━━━━━',
    },
  },
  en: {
    jadwaltv: {
      failed: '╭─❏ 😿 「 *FAILED TO FETCH SCHEDULE* 」\n┊ Mouu, failed to fetch the schedule: *{message}*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *CHANNEL NOT FOUND* 」\n┊ Mouu, the channel *{q}* was not found~\n┊ ᴛʏᴘᴇ *.jadwaltv* ᴡɪᴛʜᴏᴜᴛ ᴀʀɢᴜᴍᴇɴᴛꜱ ꜰᴏʀ ᴛʜᴇ ᴄʜᴀɴɴᴇʟ ʟɪꜱᴛ.\n╰━━━━━━━',
      listHeader: '╭─❏ 📺 「 *TV CHANNEL LIST* 」\n┊ ᴛʏᴘᴇ *.jadwaltv <name>* ꜰᴏʀ ᴛᴏᴅᴀʏ ꜱᴄʜᴇᴅᴜʟᴇ.',
      chanItem: '┊ • {name}',
      listFooter: '╰━━━━━━━',
      schedHeader: '╭─❏ 📺 「 *{channel} SCHEDULE TODAY* 」',
      schedItem: '┊ 🕐 {time} WIB: *{show}*',
      schedFooter: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.jadwaltv rcti', expect: /JADWAL RCTI|RCTI/ }

const CHANNELS = ['rcti', 'sctv', 'mnctv', 'indosiar', 'antv', 'transtv', 'trans7', 'gtv', 'tvone', 'metrotv', 'kompastv', 'net', 'rtv', 'inewstv', 'moji', 'mentari']

// Urai daftar channel dari HTML jadwaltv.net.
export function parseChannels(html) {
  const found = new Set()
  for (const m of String(html || '').matchAll(/jadwal-acara\/([a-z0-9]+)/gi)) {
    const name = m[1].toLowerCase()
    if (name.length >= 2 && name.length <= 12) found.add(name)
  }
  return [...found]
}

// Urai baris jadwal (jam + acara) dari halaman channel.
export function parseSchedule(html, limit = 20) {
  const $ = cheerio.load(String(html || ''))
  const rows = []
  $('table tr').each((_, tr) => {
    const cells = $(tr).find('td').map((__, td) => $(td).text().trim()).get()
    if (cells.length >= 2 && /^\d{1,2}[:.]\d{2}$/.test(cells[0])) {
      rows.push({ time: cells[0].replace('.', ':'), show: cells[1] })
    }
  })
  if (rows.length) return rows.slice(0, limit)
  const text = $('body').text().replace(/\s+/g, ' ')
  const re = /(\d{1,2}:\d{2})\s+([A-Z][A-Za-z0-9 :&.,'!/-]{2,50})/g
  for (const m of text.matchAll(re)) {
    rows.push({ time: m[1], show: m[2].trim() })
    if (rows.length >= limit) break
  }
  return rows
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`jadwaltv HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { fetchPage = fetchHtml } = {}) {
  const q = (ctx.text || '').trim().toLowerCase().replace(/\s+/g, '')
  try {
    if (!q) {
      const channels = parseChannels(await fetchPage('https://www.jadwaltv.net/'))
      const list = channels.length ? channels : CHANNELS
      const lines = [ctx.t('jadwaltv.listHeader')]
      for (const name of list.slice(0, 30)) lines.push(ctx.t('jadwaltv.chanItem', { name: name.toUpperCase() }))
      lines.push(ctx.t('jadwaltv.listFooter'))
      return ctx.reply(lines.join('\n'))
    }
    const rows = parseSchedule(await fetchPage(`https://www.jadwaltv.net/jadwal-acara/${encodeURIComponent(q)}`))
    if (!rows.length) return ctx.reply(ctx.t('jadwaltv.notFound', { q }))
    const lines = [ctx.t('jadwaltv.schedHeader', { channel: q.toUpperCase() })]
    for (const row of rows) lines.push(ctx.t('jadwaltv.schedItem', row))
    lines.push(ctx.t('jadwaltv.schedFooter'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('jadwaltv.failed', { message: err.message }))
  }
}
