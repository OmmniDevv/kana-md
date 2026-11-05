// Jadwal sepak bola hari ini dari TheSportsDB (kunci uji publik 123).
// Terverifikasi 2026-11-05: eventsday mengembalikan pertandingan hari
// berjalan beserta liga dan jam mainnya.
export const config = {
  name: 'jadwalbola',
  alias: ['jadwalsepakbola', 'footballfixtures'],
  category: 'info',
  description: { id: 'Jadwal pertandingan sepak bola hari ini (TheSportsDB)', en: 'Today football fixtures (TheSportsDB)' },
  usage: '.jadwalbola',
  example: '.jadwalbola',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    jadwalbola: {
      failed: '╭─❏ 😿 「 *GAGAL AMBIL JADWAL* 」\n┊ Mouu, gagal ambil jadwal bolanya: *{message}*\n╰━━━━━━━',
      empty: '╭─❏ ⚽ 「 *JADWAL BOLA {date}* 」\n┊ ʜᴀʀɪ ɪɴɪ ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴘᴇʀᴛᴀɴᴅɪɴɢᴀɴ ᴅɪ ᴅᴀᴛᴀ ᴛʜᴇꜱᴘᴏʀᴛꜱᴅʙ~\n┊ ᴄᴏʙᴀ *.livescore* ʙᴜᴀᴛ ꜱᴋᴏʀ ʟᴀɴɢꜱᴜɴɢ ʏᴀ.\n╰━━━━━━━',
      header: '╭─❏ ⚽ 「 *JADWAL BOLA {date}* 」',
      item: '┊ 🕐 {time} | *{home} vs {away}*\n┊ 🏆 {league}',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    jadwalbola: {
      failed: '╭─❏ 😿 「 *FAILED TO FETCH FIXTURES* 」\n┊ Mouu, failed to fetch the fixtures: *{message}*\n╰━━━━━━━',
      empty: '╭─❏ ⚽ 「 *FOOTBALL FIXTURES {date}* 」\n┊ ɴᴏ ᴍᴀᴛᴄʜᴇꜱ ᴛᴏᴅᴀʏ ɪɴ ᴛʜᴇ ᴛʜᴇꜱᴘᴏʀᴛꜱᴅʙ ᴅᴀᴛᴀ~\n┊ ᴛʀʏ *.livescore* ꜰᴏʀ ʟɪᴠᴇ ꜱᴄᴏʀᴇꜱ.\n╰━━━━━━━',
      header: '╭─❏ ⚽ 「 *FOOTBALL FIXTURES {date}* 」',
      item: '┊ 🕐 {time} | *{home} vs {away}*\n┊ 🏆 {league}',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.jadwalbola', expect: /JADWAL BOLA|FOOTBALL FIXTURES/ }

const API_KEY = '123'

// Tanggal hari ini di WIB dalam format yyyy-mm-dd.
export function todayWib() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function parseEvents(json, limit = 15) {
  const events = json?.events
  if (!Array.isArray(events)) return []
  return events.slice(0, limit).map((e) => ({
    time: (e.strTime || '').slice(0, 5) || '--:--',
    home: e.strHomeTeam || '-',
    away: e.strAwayTeam || '-',
    league: e.strLeague || '-',
  }))
}

async function fetchDay(date) {
  const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${date}&s=Soccer`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`TheSportsDB HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { fetchEvents = fetchDay } = {}) {
  const date = todayWib()
  let events
  try {
    events = parseEvents(await fetchEvents(date))
  } catch (err) {
    return ctx.reply(ctx.t('jadwalbola.failed', { message: err.message }))
  }
  if (!events.length) return ctx.reply(ctx.t('jadwalbola.empty', { date }))
  const lines = [ctx.t('jadwalbola.header', { date })]
  events.forEach((e) => lines.push(ctx.t('jadwalbola.item', e)))
  lines.push(ctx.t('jadwalbola.footer'))
  return ctx.reply(lines.join('\n'))
}
