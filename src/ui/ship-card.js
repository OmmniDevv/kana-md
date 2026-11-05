// Kartu ship: dua foto profil lingkaran besar dan persen kecocokan di
// tengah pada canvas 800x400, mengikuti komposisi ship Elaina-MD.
// Latar digambar lokal (gradasi + pola hati vektor) supaya render tidak
// tergantung unduhan gambar luar; avatar jatuh ke inisial bila fotonya
// tidak bisa dimuat.
import { existsSync } from 'node:fs'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'

export const SHIP_CARD_WIDTH = 800
export const SHIP_CARD_HEIGHT = 400

const FONT_CANDIDATES = [
  {
    regular: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
    bold: '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf',
  },
  {
    regular: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  },
  {
    regular: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    bold: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  },
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
      GlobalFonts.registerFromPath(candidate.regular, 'KanaSans')
      GlobalFonts.registerFromPath(candidate.bold, 'KanaSans')
      fontFamily = 'KanaSans'
      return
    } catch {
      // Coba kandidat berikutnya.
    }
  }
}

function font(weight, size) {
  return `${weight} ${size}px "${fontFamily}", "Noto Sans", "DejaVu Sans", sans-serif`
}

function fitText(ctx, text, maxWidth) {
  const value = String(text ?? '')
  if (!value) return ''
  if (ctx.measureText(value).width <= maxWidth) return value
  let out = value
  while (out.length > 0 && ctx.measureText(`${out}...`).width > maxWidth) out = out.slice(0, -1)
  return out ? `${out}...` : ''
}

function initialsOf(name) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  return words.slice(0, 2).map((w) => Array.from(w)[0] || '').join('').toUpperCase()
}

function drawCover(ctx, image, x, y, w, h) {
  const scale = Math.max(w / image.width, h / image.height)
  const dw = image.width * scale
  const dh = image.height * scale
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

async function loadAvatar(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) return null
  try {
    return await loadImage(buffer)
  } catch {
    return null
  }
}

// Hati vektor (bezier), tidak tergantung font emoji.
function drawHeart(ctx, cx, cy, size, color) {
  const top = cy - size * 0.35
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.55)
  ctx.bezierCurveTo(cx - size * 1.1, cy - size * 0.15, cx - size * 0.62, top - size * 0.62, cx, top)
  ctx.bezierCurveTo(cx + size * 0.62, top - size * 0.62, cx + size * 1.1, cy - size * 0.15, cx, cy + size * 0.55)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
  ctx.shadowBlur = 12
  ctx.fill()
  ctx.restore()
}

function drawAvatar(ctx, image, name, x, y, size) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  if (image) {
    drawCover(ctx, image, x, y, size, size)
  } else {
    ctx.fillStyle = '#31204d'
    ctx.fillRect(x, y, size, size)
    ctx.fillStyle = '#f0abfc'
    ctx.font = font(700, 92)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initialsOf(name), x + size / 2, y + size / 2 + 4)
  }
  ctx.restore()

  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.lineWidth = 10
  ctx.strokeStyle = '#f0f0f0'
  ctx.stroke()
}

// Render kartu ship. data: { name1, name2, avatar1Buffer, avatar2Buffer,
// percent, title }. Mengembalikan Buffer PNG 800x400.
export async function renderShipCard(data = {}) {
  ensureFonts()
  const canvas = createCanvas(SHIP_CARD_WIDTH, SHIP_CARD_HEIGHT)
  const ctx = canvas.getContext('2d')
  const percent = Math.max(0, Math.min(100, Math.floor(Number(data.percent) || 0)))
  const name1 = String(data.name1 ?? '-')
  const name2 = String(data.name2 ?? '-')

  const gradient = ctx.createLinearGradient(0, 0, SHIP_CARD_WIDTH, SHIP_CARD_HEIGHT)
  gradient.addColorStop(0, '#2b103f')
  gradient.addColorStop(0.55, '#4a1042')
  gradient.addColorStop(1, '#160b2e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SHIP_CARD_WIDTH, SHIP_CARD_HEIGHT)

  // Pola hati kecil samar di latar.
  for (const [x, y, s, a] of [[120, 52, 16, 0.16], [682, 46, 13, 0.14], [400, 42, 11, 0.12], [88, 356, 12, 0.12], [706, 352, 15, 0.15]]) {
    ctx.save()
    ctx.globalAlpha = a
    drawHeart(ctx, x, y, s, '#ffffff')
    ctx.restore()
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  ctx.fillRect(0, 0, SHIP_CARD_WIDTH, SHIP_CARD_HEIGHT)

  const [avatar1, avatar2] = [await loadAvatar(data.avatar1Buffer), await loadAvatar(data.avatar2Buffer)]
  drawAvatar(ctx, avatar1, name1, 50, 62, 260)
  drawAvatar(ctx, avatar2, name2, 490, 62, 260)

  drawHeart(ctx, 400, 148, 52, percent > 50 ? '#f43f5e' : '#64748b')
  ctx.fillStyle = '#ffffff'
  ctx.font = font(700, 66)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 10
  ctx.fillText(`${percent}%`, 400, 252)
  ctx.shadowBlur = 0

  ctx.font = font(700, 29)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(fitText(ctx, name1, 250), 180, 356)
  ctx.fillText(fitText(ctx, name2, 250), 620, 356)

  if (data.title) {
    ctx.font = font(700, 24)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.fillText(fitText(ctx, String(data.title), 420), 400, 34)
  }

  return canvas.toBuffer('image/png')
}
