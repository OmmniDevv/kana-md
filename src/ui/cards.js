// Renderer kartu canvas KANA (template orisinal): level, RPG, quote,
// wanted, poster film, dan tarot. Semua digambar lokal dengan
// @napi-rs/canvas, tanpa layanan gambar luar.
import { existsSync } from 'node:fs'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'

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
      GlobalFonts.registerFromPath(candidate.regular, 'KanaCard')
      GlobalFonts.registerFromPath(candidate.bold, 'KanaCard')
      fontFamily = 'KanaCard'
      return
    } catch {}
  }
}

function font(weight, size) {
  return `${weight} ${size}px "${fontFamily}", sans-serif`
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

function wrap(c, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (c.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function gradientBg(c, w, h, from, to) {
  const g = c.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  c.fillStyle = g
  c.fillRect(0, 0, w, h)
}

function panel(c, x, y, w, h) {
  roundRect(c, x, y, w, h, 24)
  c.fillStyle = 'rgba(10, 8, 24, 0.78)'
  c.fill()
  c.strokeStyle = 'rgba(255, 255, 255, 0.18)'
  c.lineWidth = 2
  c.stroke()
}

function progressBar(c, x, y, w, ratio, color) {
  roundRect(c, x, y, w, 22, 11)
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fill()
  const filled = Math.max(0, Math.min(1, ratio)) * w
  if (filled > 4) {
    roundRect(c, x, y, filled, 22, 11)
    c.fillStyle = color
    c.fill()
  }
}

function footer(c, w, h, text = 'KANA • OmniDevv') {
  c.font = font('400', 22)
  c.fillStyle = 'rgba(255, 255, 255, 0.55)'
  c.textAlign = 'right'
  c.fillText(text, w - 28, h - 22)
  c.textAlign = 'left'
}

function base(width, height, from, to) {
  ensureFonts()
  const canvas = createCanvas(width, height)
  const c = canvas.getContext('2d')
  gradientBg(c, width, height, from, to)
  return { canvas, c }
}

export async function levelCard({ name, level, xp, xpNow, xpNext }) {
  const { canvas, c } = base(1000, 520, '#2b1055', '#7597de')
  panel(c, 40, 40, 920, 440)
  c.fillStyle = '#ffd166'
  c.font = font('700', 44)
  c.fillText('⭐ LEVEL CARD', 80, 120)
  c.fillStyle = '#ffffff'
  c.font = font('700', 64)
  c.fillText(String(name).slice(0, 24), 80, 205)
  c.font = font('700', 120)
  c.fillStyle = '#7dffc4'
  c.textAlign = 'right'
  c.fillText(String(level), 920, 215)
  c.textAlign = 'left'
  c.font = font('400', 30)
  c.fillStyle = '#cfd8ff'
  c.fillText(`Total XP: ${xp}`, 80, 285)
  const ratio = xpNext > xpNow ? (xp - xpNow) / (xpNext - xpNow) : 1
  progressBar(c, 80, 330, 840, ratio, '#3dffa8')
  c.font = font('400', 26)
  c.fillStyle = '#a9cdbb'
  c.fillText(`${xp - xpNow} / ${xpNext - xpNow} XP ke level berikutnya`, 80, 395)
  footer(c, 1000, 520)
  return canvas.toBuffer('image/png')
}

export async function rpgCard({ name, level, power, coins, bank, energy, job, pet }) {
  const { canvas, c } = base(1000, 560, '#0f2027', '#2c5364')
  panel(c, 40, 40, 920, 480)
  c.fillStyle = '#ffd166'
  c.font = font('700', 42)
  c.fillText('⚔️ RPG STATUS', 80, 115)
  c.fillStyle = '#ffffff'
  c.font = font('700', 54)
  c.fillText(String(name).slice(0, 24), 80, 185)
  const rows = [
    ['Level', String(level)],
    ['Power', String(power)],
    ['Koin', String(coins)],
    ['Bank', String(bank)],
    ['Job', String(job)],
    ['Pet', String(pet)],
  ]
  c.font = font('400', 32)
  rows.forEach(([k, v], i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 80 + col * 450
    const y = 260 + row * 62
    c.fillStyle = '#9fb7c9'
    c.fillText(`${k}:`, x, y)
    c.fillStyle = '#ffffff'
    c.font = font('700', 32)
    c.fillText(v.slice(0, 18), x + 130, y)
    c.font = font('400', 32)
  })
  c.fillStyle = '#9fb7c9'
  c.font = font('400', 30)
  c.fillText('Energi:', 80, 470)
  progressBar(c, 210, 448, 620, energy / 100, '#ffb703')
  c.fillStyle = '#ffffff'
  c.fillText(`${energy}/100`, 850, 470)
  footer(c, 1000, 560)
  return canvas.toBuffer('image/png')
}

export async function quoteCard({ text, author }) {
  const { canvas, c } = base(1000, 620, '#17102b', '#4a1d6b')
  panel(c, 40, 40, 920, 540)
  c.fillStyle = '#e879f9'
  c.font = font('700', 90)
  c.fillText('“', 70, 140)
  c.fillStyle = '#ffffff'
  c.font = font('400', 44)
  const lines = wrap(c, text, 800).slice(0, 7)
  lines.forEach((line, i) => c.fillText(line, 100, 210 + i * 58))
  c.fillStyle = '#ffd166'
  c.font = font('700', 34)
  c.textAlign = 'right'
  c.fillText(`— ${String(author).slice(0, 30)}`, 900, 520)
  c.textAlign = 'left'
  footer(c, 1000, 620)
  return canvas.toBuffer('image/png')
}

export async function wantedCard({ name, bounty }) {
  const { canvas, c } = base(800, 1000, '#8a5a2b', '#5d3a17')
  roundRect(c, 50, 50, 700, 900, 12)
  c.fillStyle = '#e8cf9f'
  c.fill()
  c.strokeStyle = '#3d270e'
  c.lineWidth = 6
  c.stroke()
  c.fillStyle = '#3d270e'
  c.textAlign = 'center'
  c.font = font('700', 110)
  c.fillText('WANTED', 400, 185)
  c.font = font('700', 40)
  c.fillText('D E A D   O R   A L I V E', 400, 250)
  roundRect(c, 200, 300, 400, 320, 16)
  c.fillStyle = '#c9a86a'
  c.fill()
  c.strokeStyle = '#3d270e'
  c.lineWidth = 4
  c.stroke()
  c.font = font('700', 150)
  c.fillStyle = '#5d3a17'
  c.fillText('🕵️', 400, 520)
  c.font = font('700', 58)
  c.fillStyle = '#3d270e'
  const lines = wrap(c, String(name).toUpperCase(), 620).slice(0, 2)
  lines.forEach((line, i) => c.fillText(line, 400, 710 + i * 64))
  c.font = font('700', 52)
  c.fillText(`BOUNTY ${bounty.toLocaleString('id-ID')} KOIN`, 400, 880)
  c.textAlign = 'left'
  return canvas.toBuffer('image/png')
}

export async function moviePosterCard({ title, genre, tagline, year }) {
  const { canvas, c } = base(800, 1200, '#0b0b1a', '#3b1157')
  const g = c.createLinearGradient(0, 500, 0, 1200)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.85)')
  c.fillStyle = g
  c.fillRect(0, 0, 800, 1200)
  c.textAlign = 'center'
  c.font = font('700', 120)
  c.fillStyle = 'rgba(255,255,255,0.9)'
  c.fillText('🎬', 400, 420)
  c.fillStyle = '#ffd166'
  c.font = font('700', 34)
  c.fillText(String(genre).toUpperCase(), 400, 760)
  c.fillStyle = '#ffffff'
  c.font = font('700', 64)
  const lines = wrap(c, String(title).toUpperCase(), 680).slice(0, 3)
  lines.forEach((line, i) => c.fillText(line, 400, 850 + i * 74))
  c.font = font('400', 30)
  c.fillStyle = '#cfd8ff'
  const tag = wrap(c, tagline, 640).slice(0, 2)
  tag.forEach((line, i) => c.fillText(line, 400, 850 + lines.length * 74 + 30 + i * 40))
  c.font = font('400', 26)
  c.fillStyle = 'rgba(255,255,255,0.6)'
  c.fillText(`KANA PICTURES • ${year}`, 400, 1150)
  c.textAlign = 'left'
  return canvas.toBuffer('image/png')
}

export async function tarotCardImage({ name, numeral, meaning, emoji }) {
  const { canvas, c } = base(700, 1050, '#1b1035', '#0d0d1f')
  roundRect(c, 60, 60, 580, 930, 28)
  c.fillStyle = 'rgba(232, 121, 249, 0.08)'
  c.fill()
  c.strokeStyle = '#e879f9'
  c.lineWidth = 4
  c.stroke()
  roundRect(c, 85, 85, 530, 880, 20)
  c.strokeStyle = 'rgba(255, 209, 102, 0.7)'
  c.lineWidth = 2
  c.stroke()
  c.textAlign = 'center'
  c.fillStyle = '#ffd166'
  c.font = font('700', 40)
  c.fillText(numeral, 350, 165)
  c.font = font('400', 170)
  c.fillText(emoji, 350, 430)
  c.fillStyle = '#ffffff'
  c.font = font('700', 52)
  const nameLines = wrap(c, String(name).toUpperCase(), 480).slice(0, 2)
  nameLines.forEach((line, i) => c.fillText(line, 350, 560 + i * 60))
  c.fillStyle = '#cfd8ff'
  c.font = font('400', 30)
  const meaningLines = wrap(c, meaning, 470).slice(0, 6)
  meaningLines.forEach((line, i) => c.fillText(line, 350, 720 + i * 42))
  c.textAlign = 'left'
  return canvas.toBuffer('image/png')
}
