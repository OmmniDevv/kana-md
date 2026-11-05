// Kartu profil WhatsApp palsu: render tampilan profil WA (foto besar,
// nama, nomor, status) ke PNG memakai @napi-rs/canvas. Template orisinal
// KANA bergaya layar profil WhatsApp mode gelap; fungsi murni menggambar
// dari data yang diberikan pemanggil.
import { existsSync } from 'node:fs'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'

export const WA_CARD_WIDTH = 900
export const WA_CARD_HEIGHT = 1120

const COLORS = {
  bg: '#0b141a',
  header: '#1f2c34',
  panel: '#111b21',
  panelStroke: 'rgba(255, 255, 255, 0.08)',
  accent: '#00a884',
  text: '#e9edef',
  muted: '#8696a0',
  avatarFallback: '#2a3942',
}

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
      // Coba kandidat font berikutnya.
    }
  }
}

function font(weight, size) {
  return `${weight} ${size}px "${fontFamily}", "Noto Sans", "DejaVu Sans", sans-serif`
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.lineTo(x + radius, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

function drawCover(ctx, image, x, y, w, h) {
  if (!image?.width || !image?.height) return
  const scale = Math.max(w / image.width, h / image.height)
  const dw = image.width * scale
  const dh = image.height * scale
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

function fitText(ctx, text, maxWidth) {
  const value = String(text ?? '')
  if (!value) return ''
  if (ctx.measureText(value).width <= maxWidth) return value
  const suffix = '...'
  if (ctx.measureText(suffix).width > maxWidth) return suffix
  let out = value
  while (out.length > 0 && ctx.measureText(out + suffix).width > maxWidth) {
    out = out.slice(0, -1)
  }
  return out ? `${out}${suffix}` : suffix
}

function initialsOf(name) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] || '')
    .join('')
    .toUpperCase()
}

// Format nomor ala tampilan WA: 6281234567890 menjadi +62 812-3456-7890.
export function formatWaNumber(value) {
  let digits = String(value ?? '').replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  if (!digits) return ''
  if (!digits.startsWith('62') || digits.length <= 5) return `+${digits}`
  const rest = digits.slice(2)
  const groups = [rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter(Boolean)
  return `+62 ${groups.join('-')}`
}

async function loadAvatar(avatarBuffer) {
  if (!Buffer.isBuffer(avatarBuffer) || avatarBuffer.length === 0) return null
  try {
    return await loadImage(avatarBuffer)
  } catch {
    return null
  }
}

function drawAvatar(ctx, avatarImage, name, cx, cy, r) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  if (avatarImage) {
    drawCover(ctx, avatarImage, cx - r, cy - r, r * 2, r * 2)
  } else {
    ctx.fillStyle = COLORS.avatarFallback
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
    ctx.fillStyle = COLORS.muted
    ctx.font = font(700, r * 0.85)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initialsOf(name), cx, cy + 4)
  }
  ctx.restore()
}

function drawRow(ctx, { x, y, w, label, value }) {
  roundedRectPath(ctx, x, y, w, 118, 18)
  ctx.fillStyle = COLORS.panel
  ctx.fill()
  ctx.strokeStyle = COLORS.panelStroke
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Lencana ikon hijau ala WA di sisi kiri baris.
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + 62, y + 59, 30, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 168, 132, 0.16)'
  ctx.fill()
  ctx.fillStyle = COLORS.accent
  ctx.font = font(700, 30)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.slice(0, 1).toUpperCase(), x + 62, y + 61)
  ctx.restore()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = COLORS.muted
  ctx.font = font(700, 20)
  ctx.fillText(fitText(ctx, label.toUpperCase(), w - 150), x + 116, y + 36)
  ctx.fillStyle = COLORS.text
  ctx.font = font(400, 31)
  ctx.fillText(fitText(ctx, value, w - 150), x + 116, y + 80)
}

// Render kartu profil WA palsu. Mengembalikan Buffer PNG 900x1120.
// data: { name, number, status, avatarBuffer, labels: { profile, status, phone, footer } }
export async function renderWaProfileCard(data = {}) {
  ensureFonts()
  const width = WA_CARD_WIDTH
  const height = WA_CARD_HEIGHT
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const name = String(data.name || '-')
  const number = formatWaNumber(data.number || '')
  const status = String(data.status || '')
  const labels = {
    profile: String(data.labels?.profile ?? 'Profile'),
    status: String(data.labels?.status ?? 'Status'),
    phone: String(data.labels?.phone ?? 'Phone'),
    footer: String(data.labels?.footer ?? ''),
  }

  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, width, height)

  // Bar atas ala layar profil WA: panah kembali, judul, titik tiga.
  ctx.fillStyle = COLORS.header
  ctx.fillRect(0, 0, width, 120)
  ctx.fillStyle = COLORS.text
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.font = font(700, 44)
  ctx.fillText('<', 36, 62)
  ctx.font = font(700, 34)
  ctx.fillText(fitText(ctx, labels.profile, 500), 104, 62)
  ctx.textAlign = 'right'
  ctx.font = font(700, 40)
  ctx.fillText(':', width - 44, 62)
  ctx.textAlign = 'left'

  // Foto profil besar di tengah.
  const avatarImage = await loadAvatar(data.avatarBuffer)
  drawAvatar(ctx, avatarImage, name, width / 2, 356, 158)

  // Nama dan nomor di bawah foto.
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.text
  ctx.font = font(700, 52)
  ctx.fillText(fitText(ctx, name, width - 120), width / 2, 592)
  ctx.fillStyle = COLORS.muted
  ctx.font = font(400, 34)
  ctx.fillText(fitText(ctx, number, width - 120), width / 2, 652)

  // Baris status dan nomor ala info profil WA.
  const rowX = 56
  const rowW = width - 112
  drawRow(ctx, { x: rowX, y: 724, w: rowW, label: labels.status, value: status })
  drawRow(ctx, { x: rowX, y: 866, w: rowW, label: labels.phone, value: number })

  if (labels.footer) {
    ctx.textAlign = 'center'
    ctx.fillStyle = COLORS.muted
    ctx.font = font(400, 24)
    ctx.fillText(fitText(ctx, labels.footer, width - 120), width / 2, 1046)
  }

  return canvas.toBuffer('image/png')
}
