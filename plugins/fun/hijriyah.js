import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'hijriyah',
  alias: ['hijriah', 'kalenderhijriah'],
  category: 'fun',
  description: { id: 'Konversi tanggal Masehi ke Hijriah (hari ini atau tanggal pilihan)', en: 'Convert Gregorian dates to Hijri (today or a chosen date)' },
  usage: '.hijriyah [YYYY-MM-DD]',
  example: '.hijriyah 2026-11-04',
  cooldown: 3,
}

export const i18n = {
  id: {
    hijriyah: {
      title: 'Kalender Hijriah',
      body: '╭─❏ 🕌 「 *KALENDER HIJRIAH* 」\n┊ ᴍᴀꜱᴇʜɪ: *{greg}*\n┊ ʜɪᴊʀɪᴀʜ: *{hijri}*\n┊\n┊ Dihitung lokal memakai kalender Islam bawaan sistem yaa~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ 🕌 「 *FORMAT TANGGAL SALAH* 」\n┊ Format tanggalnya *YYYY-MM-DD* yaa, contoh *.hijriyah 2026-11-04*.\n┊ Kosongkan saja untuk hari ini~\n╰━━━━━━━',
      btnToday: '📅 Hari Ini',
      btnSholat: '🕐 Jadwal Sholat',
    },
  },
  en: {
    hijriyah: {
      title: 'Hijri Calendar',
      body: '╭─❏ 🕌 「 *HIJRI CALENDAR* 」\n┊ ɢʀᴇɢᴏʀɪᴀɴ: *{greg}*\n┊ ʜɪᴊʀɪ: *{hijri}*\n┊\n┊ Calculated locally with the built-in Islamic calendar~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ 🕌 「 *WRONG DATE FORMAT* 」\n┊ Use the date format *YYYY-MM-DD*, for example *.hijriyah 2026-11-04*.\n┊ Leave it empty for today~\n╰━━━━━━━',
      btnToday: '📅 Today',
      btnSholat: '🕐 Prayer Times',
    },
  },
}

export const test = { input: '.hijriyah', expect: /hijriah/i }

function formatGreg(date, lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(date)
}

function formatHijri(date, lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-u-ca-islamic' : 'id-ID-u-ca-islamic', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(date)
}

export async function handler(ctx) {
  const arg = (ctx.text || '').trim()
  const replies = [
    { text: ctx.t('hijriyah.btnToday'), id: '.hijriyah' },
    { text: ctx.t('hijriyah.btnSholat'), id: '.sholat' },
  ]
  let date = new Date()
  if (arg) {
    const m = arg.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const parsed = m ? new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00+07:00`) : null
    if (!parsed || Number.isNaN(parsed.getTime())) {
      const body = ctx.t('hijriyah.invalid')
      return sendButtons(ctx.sock, ctx.chat, {
        title: ctx.t('hijriyah.title'),
        body,
        footer: ctx.t('menu.footer'),
        replies,
        textFallback: body,
      })
    }
    date = parsed
  }
  const body = ctx.t('hijriyah.body', {
    greg: formatGreg(date, ctx.lang),
    hijri: formatHijri(date, ctx.lang),
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('hijriyah.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
