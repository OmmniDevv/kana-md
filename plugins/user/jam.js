export const config = {
  name: 'jam',
  alias: ['waktu', 'waktuglobal'],
  category: 'user',
  description: { id: 'Lihat jam sekarang di WIB, WITA, WIT, dan UTC', en: 'See the current time in WIB, WITA, WIT, and UTC' },
  usage: '.jam',
  example: '.jam',
  cooldown: 3,
}

export const i18n = {
  id: {
    jam: {
      title: 'Jam Sekarang 🕰️',
      body: '╭─❏ 🕰️ 「 *JAM SEKARANG* 」\n┊ Sekarang jam segini nih~\n┊ 🕰️ WIB (Jakarta): *{wib}*\n┊ 🕰️ WITA (Makassar): *{wita}*\n┊ 🕰️ WIT (Jayapura): *{wit}*\n┊ 🌍 UTC: *{utc}*\n╰━━━━━━━\n{mood}',
    },
  },
  en: {
    jam: {
      title: 'Current Time 🕰️',
      body: '╭─❏ 🕰️ 「 *CURRENT TIME* 」\n┊ The time right now~\n┊ 🕰️ WIB (Jakarta): *{wib}*\n┊ 🕰️ WITA (Makassar): *{wita}*\n┊ 🕰️ WIT (Jayapura): *{wit}*\n┊ 🌍 UTC: *{utc}*\n╰━━━━━━━\n{mood}',
    },
  },
}

function clockIn(timeZone, date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export const test = { input: '.jam', expect: /WIB/i }

export async function handler(ctx) {
  const now = new Date()
  const body = ctx.t('jam.body', {
    wib: clockIn('Asia/Jakarta', now),
    wita: clockIn('Asia/Makassar', now),
    wit: clockIn('Asia/Jayapura', now),
    utc: clockIn('UTC', now),
    mood: ctx.say('senang'),
  })
  return ctx.reply(body)
}
