// Cari tempat lewat OpenStreetMap Nominatim (gratis tanpa kunci),
// hasil ditampilkan dengan tautan Apple Maps untuk titik teratas.
export const config = {
  name: 'applemaps',
  alias: ['maps', 'applemap', 'carilokasi'],
  category: 'search',
  description: { id: 'Cari lokasi dan detail tempat, lengkap dengan tautan Apple Maps', en: 'Search for a place and its details, with an Apple Maps link' },
  usage: '.applemaps <nama tempat>',
  example: '.applemaps Monas Jakarta',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    applemaps: {
      needQuery: '╭─❏ 🗺️ 「 *KETIK NAMA TEMPATNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.applemaps Monas Jakarta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TEMPAT TIDAK KETEMU* 」\n┊ Mouu, tempat *{q}* tidak ketemu. Coba nama yang lebih spesifik ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencariannya gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      header: '╭─❏ 🗺️ 「 *HASIL: {q}* 」',
      item: '┊ {n}. *{name}*\n┊ {address}\n┊ 📍 {lat}, {lon}',
      footer: '┊ 🍎 ᴀᴘᴘʟᴇ ᴍᴀᴘꜱ: {link}\n╰━━━━━━━',
    },
  },
  en: {
    applemaps: {
      needQuery: '╭─❏ 🗺️ 「 *TYPE THE PLACE NAME* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.applemaps Eiffel Tower*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PLACE NOT FOUND* 」\n┊ Mouu, the place *{q}* was not found. Try a more specific name~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🗺️ 「 *RESULTS: {q}* 」',
      item: '┊ {n}. *{name}*\n┊ {address}\n┊ 📍 {lat}, {lon}',
      footer: '┊ 🍎 ᴀᴘᴘʟᴇ ᴍᴀᴘꜱ: {link}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.applemaps Monas Jakarta', expect: /Monas|APPLE MAPS/i }

export function parseNominatim(json, limit = 5) {
  if (!Array.isArray(json)) return []
  return json.slice(0, limit).map((row) => ({
    name: row.name || String(row.display_name || '').split(',')[0] || '-',
    address: row.display_name || '-',
    lat: row.lat,
    lon: row.lon,
    type: row.type || '',
  })).filter((row) => row.lat && row.lon)
}

async function searchPlaces(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot/1.0 (WhatsApp bot)', accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { search = searchPlaces } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('applemaps.needQuery'))
  let places
  try {
    places = parseNominatim(await search(q))
  } catch (err) {
    return ctx.reply(ctx.t('applemaps.failed', { message: err.message }))
  }
  if (!places.length) return ctx.reply(ctx.t('applemaps.notFound', { q }))
  const lines = [ctx.t('applemaps.header', { q })]
  places.forEach((p, i) => {
    lines.push(ctx.t('applemaps.item', { n: i + 1, name: p.name, address: p.address, lat: p.lat, lon: p.lon }))
  })
  const top = places[0]
  lines.push(ctx.t('applemaps.footer', { link: `https://maps.apple.com/?ll=${top.lat},${top.lon}&q=${encodeURIComponent(top.name)}` }))
  return ctx.reply(lines.join('\n'))
}
