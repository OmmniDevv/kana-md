// Waktu sekarang di kota atau zona waktu lain, memakai Intl bawaan
// Node dengan basis data zona IANA. Nama kota umum dipetakan lokal.
export const config = {
  name: 'timeis',
  alias: ['waktusekarang', 'jamberapa', 'worldclock'],
  category: 'tools',
  description: { id: 'Lihat jam sekarang di kota atau zona waktu lain', en: 'See the current time in another city or timezone' },
  usage: '.timeis <kota atau zona>',
  example: '.timeis tokyo',
  cooldown: 3,
}

export const i18n = {
  id: {
    timeis: {
      unknown: '╭─❏ 🕐 「 *ZONA TIDAK KENAL* 」\n┊ Mouu, *{q}* tidak KANA kenal~\n┊ ᴄᴏʙᴀ: ᴊᴀᴋᴀʀᴛᴀ, ᴛᴏᴋʏᴏ, ʟᴏɴᴅᴏɴ, ɴᴇᴡ ʏᴏʀᴋ, ᴅᴜʙᴀɪ, ꜱɪɴɢᴀᴘᴏʀᴇ, ᴘᴀʀɪꜱ, ꜱʏᴅɴᴇʏ, ᴀᴛᴀᴜ ɴᴀᴍᴀ ᴢᴏɴᴀ ɪᴀɴᴀ ꜱᴇᴘᴇʀᴛɪ *ᴀꜱɪᴀ/ᴊᴀᴋᴀʀᴛᴀ*.\n╰━━━━━━━',
      out: '╭─❏ 🕐 「 *WAKTU DI {label}* 」\n┊ 🗓️ {date}\n┊ ⏰ *{time}*\n┊ ᴢᴏɴᴀ: {zone}\n╰━━━━━━━',
    },
  },
  en: {
    timeis: {
      unknown: '╭─❏ 🕐 「 *UNKNOWN ZONE* 」\n┊ Mouu, KANA does not know *{q}*~\n┊ ᴛʀʏ: ᴊᴀᴋᴀʀᴛᴀ, ᴛᴏᴋʏᴏ, ʟᴏɴᴅᴏɴ, ɴᴇᴡ ʏᴏʀᴋ, ᴅᴜʙᴀɪ, ꜱɪɴɢᴀᴘᴏʀᴇ, ᴘᴀʀɪꜱ, ꜱʏᴅɴᴇʏ, ᴏʀ ᴀɴ ɪᴀɴᴀ ɴᴀᴍᴇ ʟɪᴋᴇ *ᴀꜱɪᴀ/ᴊᴀᴋᴀʀᴛᴀ*.\n╰━━━━━━━',
      out: '╭─❏ 🕐 「 *TIME IN {label}* 」\n┊ 🗓️ {date}\n┊ ⏰ *{time}*\n┊ ᴢᴏɴᴇ: {zone}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.timeis tokyo', expect: /TOKYO|WAKTU DI/ }

const CITY_ZONES = {
  jakarta: 'Asia/Jakarta', bandung: 'Asia/Jakarta', surabaya: 'Asia/Jakarta',
  makassar: 'Asia/Makassar', bali: 'Asia/Makassar', denpasar: 'Asia/Makassar',
  jayapura: 'Asia/Jayapura', singapore: 'Asia/Singapore', singapura: 'Asia/Singapore',
  tokyo: 'Asia/Tokyo', seoul: 'Asia/Seoul', beijing: 'Asia/Shanghai', shanghai: 'Asia/Shanghai',
  hongkong: 'Asia/Hong_Kong', dubai: 'Asia/Dubai', mekkah: 'Asia/Riyadh', makkah: 'Asia/Riyadh',
  riyadh: 'Asia/Riyadh', london: 'Europe/London', paris: 'Europe/Paris', berlin: 'Europe/Berlin',
  amsterdam: 'Europe/Amsterdam', 'new york': 'America/New_York', newyork: 'America/New_York',
  'los angeles': 'America/Los_Angeles', chicago: 'America/Chicago', sydney: 'Australia/Sydney',
  melbourne: 'Australia/Melbourne', auckland: 'Pacific/Auckland', utc: 'UTC', gmt: 'UTC',
}

// Resolusi masukan menjadi zona IANA, atau null.
export function resolveZone(input) {
  const key = String(input || '').trim().toLowerCase()
  if (!key) return { zone: 'Asia/Jakarta', label: 'JAKARTA' }
  if (CITY_ZONES[key]) return { zone: CITY_ZONES[key], label: key.toUpperCase() }
  if (/^[a-z_]+\/[a-z_]+$/i.test(key)) return { zone: key, label: key.toUpperCase() }
  return null
}

export async function handler(ctx) {
  const resolved = resolveZone(ctx.text || '')
  if (!resolved) return ctx.reply(ctx.t('timeis.unknown', { q: (ctx.text || '').trim() }))
  const now = new Date()
  let dateStr
  let timeStr
  try {
    dateStr = new Intl.DateTimeFormat('id-ID', { timeZone: resolved.zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    timeStr = new Intl.DateTimeFormat('id-ID', { timeZone: resolved.zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)
  } catch {
    return ctx.reply(ctx.t('timeis.unknown', { q: resolved.zone }))
  }
  return ctx.reply(ctx.t('timeis.out', { label: resolved.label, date: dateStr, time: timeStr, zone: resolved.zone }))
}
