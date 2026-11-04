// Hari libur nasional Indonesia: tanggal tetap dari Nager.Date (API
// kalender publik gratis), dilengkapi libur lunar/Hijriah mengikuti
// SKB 3 Menteri 2026 (Nager tidak memuat libur lunar Indonesia).
const LUNAR_SKB = {
  2026: [
    { date: '2026-01-16', localName: 'Isra Mikraj Nabi Muhammad SAW' },
    { date: '2026-02-17', localName: 'Tahun Baru Imlek 2577 Kongzili' },
    { date: '2026-03-19', localName: 'Hari Suci Nyepi (Tahun Baru Saka 1948)' },
    { date: '2026-03-20', localName: 'Idul Fitri 1447 Hijriah' },
    { date: '2026-03-21', localName: 'Idul Fitri 1447 Hijriah' },
    { date: '2026-05-27', localName: 'Idul Adha 1447 Hijriah' },
    { date: '2026-05-31', localName: 'Hari Raya Waisak 2570 BE' },
    { date: '2026-06-16', localName: 'Tahun Baru Islam 1448 Hijriah' },
    { date: '2026-08-25', localName: 'Maulid Nabi Muhammad SAW' },
  ],
}
export const config = {
  name: 'harilibur',
  alias: ['liburnasional', 'publicholiday'],
  category: 'search',
  description: { id: 'Daftar hari libur nasional Indonesia tahun berjalan dan berikutnya', en: 'Indonesian public holidays for the current and next year' },
  usage: '.harilibur',
  example: '.harilibur',
  cooldown: 15,
}

export const i18n = {
  id: {
    harilibur: {
      head: '╭─❏ 📅 「 *LIBUR NASIONAL {year}* 」',
      upcoming: '┊ ⏭️ ʟɪʙᴜʀ ᴛᴇʀᴅᴇᴋᴀᴛ: *{name} ({date})*, *{days} hari lagi*',
      passed: '┊ ꜱᴜᴅᴀʜ ʟᴇᴡᴀᴛ: *{count} hari libur*\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL AMBIL DATA LIBUR* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    harilibur: {
      head: '╭─❏ 📅 「 *PUBLIC HOLIDAYS {year}* 」',
      upcoming: '┊ ⏭️ ɴᴇxᴛ ʜᴏʟɪᴅᴀʏ: *{name} ({date})*, in *{days} days*',
      passed: '┊ ᴀʟʀᴇᴀᴅʏ ᴘᴀꜱꜱᴇᴅ: *{count} holidays*\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *FAILED TO FETCH HOLIDAYS* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.harilibur', expect: /libur|holiday/i }

export async function fetchHolidays(year) {
  const res = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/ID`, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const fixed = await res.json()
  const merged = [...fixed, ...(LUNAR_SKB[year] ?? [])]
  merged.sort((a, b) => a.date.localeCompare(b.date))
  return merged
}

export async function handler(ctx) {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const list = await fetchHolidays(year)
    const today = now.toISOString().slice(0, 10)
    const upcoming = list.filter((h) => h.date >= today)
    const lines = [ctx.t('harilibur.head', { year })]
    if (upcoming.length) {
      const next = upcoming[0]
      const days = Math.ceil((new Date(next.date) - new Date(today)) / 86400000)
      lines.push(ctx.t('harilibur.upcoming', {
        name: next.localName, date: next.date, days,
      }))
      for (const h of upcoming.slice(0, 14)) lines.push(`┊ *${h.date}* · ${h.localName}`)
    }
    lines.push(ctx.t('harilibur.passed', { count: list.length - upcoming.length }))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('harilibur.fail', { error: err.message }))
  }
}
