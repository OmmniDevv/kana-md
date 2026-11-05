// Skor langsung sepak bola dari TheSportsDB livescore (kunci uji
// publik 123), fokus Liga Inggris (id 4328) plus pertandingan lain
// yang sedang berjalan bila tersedia.
export const config = {
  name: 'livescore',
  alias: ['skorlangsung'],
  category: 'info',
  description: { id: 'Skor langsung pertandingan sepak bola (TheSportsDB)', en: 'Live football scores (TheSportsDB)' },
  usage: '.livescore',
  example: '.livescore',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    livescore: {
      failed: '╭─❏ 😿 「 *GAGAL AMBIL SKOR* 」\n┊ Mouu, gagal ambil skor langsungnya: *{message}*\n╰━━━━━━━',
      empty: '╭─❏ ⚽ 「 *LIVESCORE* 」\n┊ ꜱᴀᴀᴛ ɪɴɪ ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴘᴇʀᴛᴀɴᴅɪɴɢᴀɴ ʏᴀɴɢ ꜱᴇᴅᴀɴɢ ʙᴇʀʟᴀɴɢꜱᴜɴɢ ᴅɪ ᴅᴀᴛᴀ ᴛʜᴇꜱᴘᴏʀᴛꜱᴅʙ~\n┊ ᴄᴏʙᴀ *.jadwalbola* ʙᴜᴀᴛ ᴊᴀᴅᴡᴀʟ ʜᴀʀɪ ɪɴɪ ʏᴀ.\n╰━━━━━━━',
      header: '╭─❏ ⚽ 「 *LIVESCORE* 」',
      item: '┊ *{home} {hs} - {as} {away}*\n┊ 🏆 {league} | ⏱️ {status}',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    livescore: {
      failed: '╭─❏ 😿 「 *FAILED TO FETCH SCORES* 」\n┊ Mouu, failed to fetch the live scores: *{message}*\n╰━━━━━━━',
      empty: '╭─❏ ⚽ 「 *LIVESCORE* 」\n┊ ɴᴏ ᴍᴀᴛᴄʜᴇꜱ ᴀʀᴇ ʟɪᴠᴇ ʀɪɢʜᴛ ɴᴏᴡ ɪɴ ᴛʜᴇ ᴛʜᴇꜱᴘᴏʀᴛꜱᴅʙ ᴅᴀᴛᴀ~\n┊ ᴛʀʏ *.jadwalbola* ꜰᴏʀ ᴛᴏᴅᴀʏ ꜰɪxᴛᴜʀᴇꜱ.\n╰━━━━━━━',
      header: '╭─❏ ⚽ 「 *LIVESCORE* 」',
      item: '┊ *{home} {hs} - {as} {away}*\n┊ 🏆 {league} | ⏱️ {status}',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.livescore', expect: /LIVESCORE/ }

const API_KEY = '123'

export function parseLive(json, limit = 15) {
  const events = json?.events
  if (!Array.isArray(events)) return []
  return events.slice(0, limit).map((e) => ({
    home: e.strHomeTeam || '-',
    away: e.strAwayTeam || '-',
    hs: e.intHomeScore ?? '-',
    as: e.intAwayScore ?? '-',
    league: e.strLeague || '-',
    status: e.strProgress ? `${e.strProgress}'` : (e.strStatus || 'live'),
  }))
}

async function fetchLive() {
  const urls = [
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/livescore.php?l=4328&s=Soccer`,
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/livescore.php?s=Soccer`,
  ]
  let lastError = null
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20000),
        headers: { 'user-agent': 'KANA-Bot', accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`TheSportsDB HTTP ${res.status}`)
      const json = await res.json()
      if (Array.isArray(json?.events) && json.events.length) return json
      if (Array.isArray(json?.events)) return json
    } catch (err) {
      lastError = err
    }
  }
  if (lastError) throw lastError
  return { events: [] }
}

export async function handler(ctx, { fetchScores = fetchLive } = {}) {
  let matches
  try {
    matches = parseLive(await fetchScores())
  } catch (err) {
    return ctx.reply(ctx.t('livescore.failed', { message: err.message }))
  }
  if (!matches.length) return ctx.reply(ctx.t('livescore.empty'))
  const lines = [ctx.t('livescore.header')]
  matches.forEach((m) => lines.push(ctx.t('livescore.item', m)))
  lines.push(ctx.t('livescore.footer'))
  return ctx.reply(lines.join('\n'))
}
