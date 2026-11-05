// Kartu canvas hitung mundur Ramadhan (template orisinal KANA, gambar
// lokal @napi-rs/canvas, pola sama dengan src/ui/cards.js).
// Tanggal awal Ramadhan dihitung dari kalender Islam tabular lewat Intl
// (u-ca-islamic): pindai hari demi hari mencari 1 Ramadhan berikutnya.
// Untuk 2027 itu jatuh pada 8 Februari 2027 WIB, sama dengan tanggal
// yang dipakai Elaina-MD di ramadhan2027.js.
import { existsSync } from 'node:fs'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'

export const RAMADHAN_2027_START = new Date('2027-02-08T00:00:00+07:00')

const FONT_CANDIDATES = [
  { regular: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', bold: '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf' },
  { regular: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' },
  { regular: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', bold: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' },
]
let fontFamily = 'sans-serif'
let fontsTried = false
function ensureFonts() {
  if (fontsTried) return
  fontsTried = true
  if (typeof GlobalFonts?.registerFromPath !== 'function') return
  for (const candidate of FONT_CANDIDATES) {
    try {
      if (!existsSync(candidate.regular) || !existsSync(candidate.bold)) continue
      GlobalFonts.registerFromPath(candidate.regular, 'KanaRamadhan')
      GlobalFonts.registerFromPath(candidate.bold, 'KanaRamadhan')
      fontFamily = 'KanaRamadhan'
      return
    } catch {}
  }
}
const font = (weight, size) => `${weight} ${size}px "${fontFamily}", sans-serif`

const hijriFmt = new Intl.DateTimeFormat('en-u-ca-islamic', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'numeric', year: 'numeric' })
function hijriParts(date) {
  const parts = {}
  for (const p of hijriFmt.formatToParts(date)) parts[p.type] = p.value
  return { day: Number(parts.day), month: Number(parts.month), year: Number(parts.year) }
}

// 1 Ramadhan berikutnya dari tanggal acuan (tengah malam WIB hari itu).
// Bila acuan sedang di dalam Ramadhan, kembalikan awal Ramadhan tahun ini.
export function nextRamadhanStart(from = new Date()) {
  const startOfWibDay = (d) => {
    const wib = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    wib.setHours(0, 0, 0, 0)
    return wib
  }
  let cursor = startOfWibDay(from)
  const todayHijri = hijriParts(cursor)
  if (todayHijri.month === 9) {
    // Sedang Ramadhan: mundur ke tanggal 1 bulan ini.
    const back = new Date(cursor)
    back.setDate(back.getDate() - (todayHijri.day - 1))
    return back
  }
  for (let i = 0; i < 400; i++) {
    const h = hijriParts(cursor)
    if (h.month === 9 && h.day === 1) return cursor
    cursor = new Date(cursor.getTime() + 86400000)
  }
  return cursor
}

export function daysUntil(target, from = new Date()) {
  const a = new Date(from.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const b = new Date(target.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.round((b - a) / 86400000)
}

export const RAMADHAN_CARD_WIDTH = 1000
export const RAMADHAN_CARD_HEIGHT = 560

export async function renderRamadhanCard({ title, days, dateLabel, subtitle }) {
  ensureFonts()
  const canvas = createCanvas(RAMADHAN_CARD_WIDTH, RAMADHAN_CARD_HEIGHT)
  const c = canvas.getContext('2d')
  const g = c.createLinearGradient(0, 0, 1000, 560)
  g.addColorStop(0, '#0b1026')
  g.addColorStop(1, '#1d3a2a')
  c.fillStyle = g
  c.fillRect(0, 0, 1000, 560)
  c.fillStyle = '#ffd166'
  c.font = font('400', 90)
  c.textAlign = 'center'
  c.fillText('🌙', 500, 130)
  c.font = font('700', 46)
  c.fillStyle = '#ffffff'
  c.fillText(String(title).slice(0, 42), 500, 205)
  c.font = font('700', 150)
  c.fillStyle = '#7dffc4'
  c.fillText(String(days), 500, 370)
  c.font = font('400', 34)
  c.fillStyle = '#cfd8ff'
  c.fillText(String(subtitle).slice(0, 52), 500, 425)
  c.font = font('400', 28)
  c.fillStyle = '#ffd166'
  c.fillText(String(dateLabel).slice(0, 52), 500, 480)
  c.font = font('400', 22)
  c.fillStyle = 'rgba(255,255,255,0.55)'
  c.textAlign = 'right'
  c.fillText('KANA • OmniDevv', 972, 532)
  c.textAlign = 'left'
  return canvas.toBuffer('image/png')
}
