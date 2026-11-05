// Konverter satuan lokal: panjang, berat, suhu, data, waktu.
// Semua faktor konversi dihitung di dalam bot, tanpa layanan luar.
export const config = {
  name: 'converter',
  alias: ['konversi', 'convert'],
  category: 'tools',
  description: { id: 'Konversi satuan panjang, berat, suhu, data, dan waktu', en: 'Convert length, weight, temperature, data, and time units' },
  usage: '.converter <angka> <satuan> ke <satuan>',
  example: '.converter 5 km ke m',
  cooldown: 3,
}

export const i18n = {
  id: {
    converter: {
      needInput: '╭─❏ 🔁 「 *FORMAT KONVERSI* 」\n┊ ᴄᴏɴᴛᴏʜ: *.converter 5 km ke m*\n┊ ꜱᴀᴛᴜᴀɴ: ᴋᴍ, ᴍ, ᴄᴍ, ᴍᴍ, ᴍɪ, ꜰᴛ, ɪɴ, ᴋɢ, ɢ, ᴛᴏɴ, ʟʙ, ᴏᴢ, ᴄ, ꜰ, ᴋ, ʙ, ᴋʙ, ᴍʙ, ɢʙ, ᴛʙ, ᴅᴇᴛɪᴋ, ᴍᴇɴɪᴛ, ᴊᴀᴍ, ʜᴀʀɪ\n╰━━━━━━━',
      badUnit: '╭─❏ 🤔 「 *SATUAN TIDAK COCOK* 」\n┊ Satuan *{from}* dan *{to}* tidak bisa dikonversi (beda jenis atau tidak dikenal)~\n╰━━━━━━━',
      out: '╭─❏ 🔁 「 *HASIL KONVERSI* 」\n┊ *{value} {from}* = *{result} {to}*\n╰━━━━━━━',
    },
  },
  en: {
    converter: {
      needInput: '╭─❏ 🔁 「 *CONVERSION FORMAT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.converter 5 km to m*\n┊ ᴜɴɪᴛꜱ: ᴋᴍ, ᴍ, ᴄᴍ, ᴍᴍ, ᴍɪ, ꜰᴛ, ɪɴ, ᴋɢ, ɢ, ᴛᴏɴ, ʟʙ, ᴏᴢ, ᴄ, ꜰ, ᴋ, ʙ, ᴋʙ, ᴍʙ, ɢʙ, ᴛʙ, ꜱᴇᴄᴏɴᴅ, ᴍɪɴᴜᴛᴇ, ʜᴏᴜʀ, ᴅᴀʏ\n╰━━━━━━━',
      badUnit: '╭─❏ 🤔 「 *UNITS DO NOT MATCH* 」\n┊ Units *{from}* and *{to}* cannot be converted (different kind or unknown)~\n╰━━━━━━━',
      out: '╭─❏ 🔁 「 *CONVERSION RESULT* 」\n┊ *{value} {from}* = *{result} {to}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.converter 5 km ke m', expect: /5000/ }

const LINEAR = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  weight: { mg: 0.000001, g: 0.001, kg: 1, ton: 1000, oz: 0.028349523125, lb: 0.45359237 },
  data: { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 },
  time: { detik: 1, second: 1, menit: 60, minute: 60, jam: 3600, hour: 3600, hari: 86400, day: 86400 },
}
const UNIT_ALIAS = { meter: 'm', kilometer: 'km', gram: 'g', kilogram: 'kg', celsius: 'c', celcius: 'c', fahrenheit: 'f', kelvin: 'k', byte: 'b' }
const TEMP_UNITS = new Set(['c', 'f', 'k'])

function normalizeUnit(u) {
  const raw = String(u || '').toLowerCase().replace(/°/g, '')
  return UNIT_ALIAS[raw] || raw
}

function toCelsius(value, unit) {
  if (unit === 'c') return value
  if (unit === 'f') return (value - 32) * 5 / 9
  return value - 273.15
}
function fromCelsius(value, unit) {
  if (unit === 'c') return value
  if (unit === 'f') return value * 9 / 5 + 32
  return value + 273.15
}

// Konversi nilai antar satuan; null bila tidak kompatibel.
export function convertUnits(value, fromRaw, toRaw) {
  const from = normalizeUnit(fromRaw)
  const to = normalizeUnit(toRaw)
  if (TEMP_UNITS.has(from) && TEMP_UNITS.has(to)) return fromCelsius(toCelsius(value, from), to)
  for (const group of Object.values(LINEAR)) {
    if (from in group && to in group) return value * group[from] / group[to]
  }
  return null
}

// Urai teks "5 km ke m" atau "100 c f".
export function parseConvert(text) {
  const m = String(text || '').trim().match(/^(-?[\d.,]+)\s*([a-zA-Z°]+)\s*(?:ke|to|->)?\s*([a-zA-Z°]+)$/)
  if (!m) return null
  const value = Number(m[1].replace(',', '.'))
  if (!Number.isFinite(value)) return null
  return { value, from: m[2], to: m[3] }
}

function fmt(n) {
  if (Number.isInteger(n)) return n.toLocaleString('id-ID')
  return Number(n.toFixed(6)).toLocaleString('id-ID', { maximumFractionDigits: 6 })
}

export async function handler(ctx) {
  const parsed = parseConvert(ctx.text || '')
  if (!parsed) return ctx.reply(ctx.t('converter.needInput'))
  const result = convertUnits(parsed.value, parsed.from, parsed.to)
  if (result === null) {
    return ctx.reply(ctx.t('converter.badUnit', { from: parsed.from, to: parsed.to }))
  }
  return ctx.reply(ctx.t('converter.out', {
    value: fmt(parsed.value),
    from: normalizeUnit(parsed.from),
    result: fmt(result),
    to: normalizeUnit(parsed.to),
  }))
}
