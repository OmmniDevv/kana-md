import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'konversi',
  alias: [],
  category: 'user',
  description: { id: 'Konversi satuan panjang, berat, suhu, data, dan waktu', en: 'Convert length, weight, temperature, data, and time units' },
  usage: '.konversi <nilai> <dari> <ke>',
  example: '.konversi 5 km m',
  cooldown: 3,
}

// Faktor ke satuan dasar per grup. Suhu ditangani khusus lewat Celsius.
const LINEAR = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inci: 0.0254, inch: 0.0254, in: 0.0254, kaki: 0.3048, ft: 0.3048, feet: 0.3048 },
  weight: { g: 1, kg: 1000, ons: 100, pon: 500 },
  data: { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 },
  time: { detik: 1, s: 1, menit: 60, min: 60, jam: 3600, h: 3600, hari: 86400, d: 86400 },
}
const TEMP_UNITS = ['c', 'f', 'k']

function unitGroup(unit) {
  if (TEMP_UNITS.includes(unit)) return 'temp'
  for (const [group, table] of Object.entries(LINEAR)) if (unit in table) return group
  return null
}

function toCelsius(value, from) {
  if (from === 'c') return value
  if (from === 'f') return ((value - 32) * 5) / 9
  return value - 273.15
}

function fromCelsius(value, to) {
  if (to === 'c') return value
  if (to === 'f') return (value * 9) / 5 + 32
  return value + 273.15
}

// Fungsi murni: konversi nilai antar satuan segroup. Null bila satuan tak
// dikenal atau beda grup.
export function convert(value, from, to) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const f = String(from ?? '').toLowerCase().trim()
  const t = String(to ?? '').toLowerCase().trim()
  const gf = unitGroup(f)
  const gt = unitGroup(t)
  if (!gf || !gt || gf !== gt) return null
  if (gf === 'temp') return fromCelsius(toCelsius(n, f), t)
  const table = LINEAR[gf]
  return (n * table[f]) / table[t]
}

export const SUPPORTED =
  'panjang: mm, cm, m, km, inci, kaki | berat: g, kg, ons, pon | suhu: c, f, k | data: b, kb, mb, gb, tb | waktu: detik, menit, jam, hari'

export const i18n = {
  id: {
    konversi: {
      usage: 'Formatnya: .konversi <nilai> <dari> <ke>, contoh: .konversi 5 km m~\nSatuan didukung: {units}',
      unknown: 'Satuan itu belum KANA kenal atau beda jenis nih (╥﹏╥)\nSatuan didukung: {units}',
      result: '📐 {value} {from} = {converted} {to}\n\n{mood}',
      btnMenu: 'Menu User',
    },
  },
  en: {
    konversi: {
      usage: 'Format: .konversi <value> <from> <to>, example: .konversi 5 km m~\nSupported units: {units}',
      unknown: 'KANA does not know that unit yet, or they are different kinds (╥﹏╥)\nSupported units: {units}',
      result: '📐 {value} {from} = {converted} {to}\n\n{mood}',
      btnMenu: 'User Menu',
    },
  },
}

function formatNumber(n) {
  if (Number.isInteger(n)) return String(n)
  return String(Math.round(n * 1e8) / 1e8)
}

export async function handler(ctx) {
  const [rawValue, from, to] = ctx.args
  const value = Number(String(rawValue ?? '').replace(',', '.'))
  if (rawValue === undefined || !from || !to || !Number.isFinite(value)) {
    return ctx.reply(ctx.t('konversi.usage', { units: SUPPORTED }))
  }
  const converted = convert(value, from, to)
  if (converted === null) return ctx.reply(ctx.t('konversi.unknown', { units: SUPPORTED }))
  const body = ctx.t('konversi.result', {
    value: formatNumber(value),
    from: from.toLowerCase(),
    converted: formatNumber(converted),
    to: to.toLowerCase(),
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('konversi.btnMenu'), id: '.menu user' }],
    textFallback: body,
  })
}
