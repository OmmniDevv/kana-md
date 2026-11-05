// Hitung jarak garis lurus antara dua tempat: geocode keduanya lewat
// OpenStreetMap Nominatim lalu hitung haversine secara lokal.
export const config = {
  name: 'jarak',
  alias: ['distance', 'hitungjarak'],
  category: 'tools',
  description: { id: 'Hitung jarak garis lurus antara dua tempat', en: 'Calculate the straight-line distance between two places' },
  usage: '.jarak <tempat a> ke <tempat b>',
  example: '.jarak jakarta ke bandung',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    jarak: {
      needInput: '╭─❏ 📏 「 *FORMAT JARAK* 」\n┊ ᴄᴏɴᴛᴏʜ: *.jarak jakarta ke bandung*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TEMPAT TIDAK KETEMU* 」\n┊ Mouu, salah satu tempatnya tidak ketemu: *{place}*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL HITUNG* 」\n┊ Mouu, gagal hitung jaraknya: *{message}*\n╰━━━━━━━',
      out: '╭─❏ 📏 「 *JARAK GARIS LURUS* 」\n┊ ᴅᴀʀɪ: *{a}*\n┊ ᴋᴇ: *{b}*\n┊ ᴊᴀʀᴀᴋ: *{km} km* ({mi} mil)\n┊ ᴋᴏᴏʀᴅɪɴᴀᴛ: {lat1}, {lon1} → {lat2}, {lon2}\n╰━━━━━━━',
    },
  },
  en: {
    jarak: {
      needInput: '╭─❏ 📏 「 *DISTANCE FORMAT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.jarak jakarta to bandung*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PLACE NOT FOUND* 」\n┊ Mouu, one of the places was not found: *{place}*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *CALCULATION FAILED* 」\n┊ Mouu, failed to calculate the distance: *{message}*\n╰━━━━━━━',
      out: '╭─❏ 📏 「 *STRAIGHT-LINE DISTANCE* 」\n┊ ꜰʀᴏᴍ: *{a}*\n┊ ᴛᴏ: *{b}*\n┊ ᴅɪꜱᴛᴀɴᴄᴇ: *{km} km* ({mi} miles)\n┊ ᴄᴏᴏʀᴅɪɴᴀᴛᴇꜱ: {lat1}, {lon1} → {lat2}, {lon2}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.jarak jakarta ke bandung', expect: /km/ }

// Jarak haversine dalam kilometer.
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const rad = (d) => d * Math.PI / 180
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot/1.0 (WhatsApp bot)', accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`)
  const json = await res.json()
  if (!Array.isArray(json) || !json[0]) return null
  return { name: json[0].display_name, lat: Number(json[0].lat), lon: Number(json[0].lon) }
}

export async function handler(ctx, { geo = geocode } = {}) {
  const text = (ctx.text || '').trim()
  const m = text.match(/^(.+?)\s+(?:ke|to)\s+(.+)$/i)
  if (!m) return ctx.reply(ctx.t('jarak.needInput'))
  try {
    const a = await geo(m[1].trim())
    if (!a) return ctx.reply(ctx.t('jarak.notFound', { place: m[1].trim() }))
    const b = await geo(m[2].trim())
    if (!b) return ctx.reply(ctx.t('jarak.notFound', { place: m[2].trim() }))
    const km = haversineKm(a.lat, a.lon, b.lat, b.lon)
    return ctx.reply(ctx.t('jarak.out', {
      a: a.name.split(',').slice(0, 2).join(','),
      b: b.name.split(',').slice(0, 2).join(','),
      km: km.toFixed(1),
      mi: (km * 0.621371).toFixed(1),
      lat1: a.lat.toFixed(4), lon1: a.lon.toFixed(4),
      lat2: b.lat.toFixed(4), lon2: b.lon.toFixed(4),
    }))
  } catch (err) {
    return ctx.reply(ctx.t('jarak.failed', { message: err.message }))
  }
}
