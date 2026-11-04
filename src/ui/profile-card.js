// Kartu profil bergambar: render statistik pengguna ke PNG 1000x560
// memakai @napi-rs/canvas di atas gambar latar assets/gen/profile-bg.png.
// Fungsi ini murni menggambar dari data yang diberikan pemanggil, selain
// pemuatan gambar latar yang buffer dan gambarnya disimpan di memori.
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'

export const PROFILE_CARD_WIDTH = 1000
export const PROFILE_CARD_HEIGHT = 560

const here = dirname(fileURLToPath(import.meta.url))
const BG_PATH = join(here, '../../assets/gen/profile-bg.png')

const COLORS = {
  panel: 'rgba(5, 26, 18, 0.80)',
  panelStroke: 'rgba(61, 255, 168, 0.38)',
  accent: '#3dffa8',
  accentSoft: '#7dffc4',
  text: '#f2fff8',
  muted: '#a9cdbb',
  box: 'rgba(255, 255, 255, 0.07)',
  boxStroke: 'rgba(255, 255, 255, 0.14)',
  barTrack: 'rgba(255, 255, 255, 0.14)',
  avatarFallback: '#0d3b28',
  divider: 'rgba(255, 255, 255, 0.12)',
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

let bgImageCache = null
let bgLoading = null

async function loadBackground() {
  if (bgImageCache) return bgImageCache
  if (!bgLoading) {
    bgLoading = (async () => {
      const buffer = await readFile(BG_PATH)
      const image = await loadImage(buffer)
      bgImageCache = image
      return image
    })().catch(() => null)
  }
  return bgLoading
}

// Untuk pengujian dan pemanggilan ulang yang bersih.
export function clearProfileCardCache() {
  bgImageCache = null
  bgLoading = null
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

function clampPercent(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.floor(n)))
}

function safeInt(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.floor(n)
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
    ctx.fillStyle = COLORS.accentSoft
    ctx.font = font(700, 38)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initialsOf(name), cx, cy + 2)
  }
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = COLORS.accent
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, r + 7, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(61, 255, 168, 0.28)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

// Render kartu profil. Mengembalikan Buffer PNG 1000x560.
// data: { name, number, level, xp, progress, needed, percent, balance,
// limitLeft, rankLabel, registeredLabel, avatarBuffer, botName, labels }
export async function renderProfileCard(data = {}) {
  ensureFonts()
  const width = PROFILE_CARD_WIDTH
  const height = PROFILE_CARD_HEIGHT
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const name = String(data.name ?? '-')
  const number = String(data.number ?? '')
  const level = Math.max(1, safeInt(data.level) || 1)
  const progress = Math.max(0, safeInt(data.progress))
  const needed = Math.max(1, safeInt(data.needed) || 1)
  const percent = clampPercent(data.percent ?? Math.floor((progress / needed) * 100))
  const balance = safeInt(data.balance)
  const limitLeft = Math.max(0, safeInt(data.limitLeft))
  const rankLabel = String(data.rankLabel ?? '')
  const registeredLabel = String(data.registeredLabel ?? '')
  const botName = String(data.botName ?? 'KANA')
  const labels = {
    level: String(data.labels?.level ?? 'LEVEL'),
    xp: String(data.labels?.xp ?? 'XP'),
    balance: String(data.labels?.balance ?? 'Saldo'),
    limit: String(data.labels?.limit ?? 'Limit'),
    rank: String(data.labels?.rank ?? 'Gelar'),
  }

  const background = await loadBackground()
  if (background) {
    drawCover(ctx, background, 0, 0, width, height)
  } else {
    ctx.fillStyle = '#06231a'
    ctx.fillRect(0, 0, width, height)
  }

  // Gradien gelap di sisi kiri agar panel dan teks tetap kontras.
  const gradient = ctx.createLinearGradient(0, 0, 700, 0)
  gradient.addColorStop(0, 'rgba(3, 20, 14, 0.92)')
  gradient.addColorStop(0.62, 'rgba(3, 20, 14, 0.72)')
  gradient.addColorStop(1, 'rgba(3, 20, 14, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 700, height)

  const panel = { x: 34, y: 30, w: 478, h: 500 }
  const innerX = panel.x + 28
  const innerW = panel.w - 56
  const innerRight = innerX + innerW

  roundedRectPath(ctx, panel.x, panel.y, panel.w, panel.h, 28)
  ctx.fillStyle = COLORS.panel
  ctx.fill()
  ctx.strokeStyle = COLORS.panelStroke
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.textBaseline = 'middle'

  // Nama bot kecil di kepala panel.
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.accent
  ctx.font = font(700, 17)
  ctx.fillText(fitText(ctx, botName.toUpperCase(), innerW), innerX, panel.y + 32)

  // Avatar dan identitas.
  const avatarCx = innerX + 48
  const avatarCy = panel.y + 110
  const avatarImage = await loadAvatar(data.avatarBuffer)
  drawAvatar(ctx, avatarImage, name, avatarCx, avatarCy, 46)

  const identityX = innerX + 108
  const identityW = innerRight - identityX
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.text
  ctx.font = font(700, 36)
  ctx.fillText(fitText(ctx, name, identityW), identityX, panel.y + 88)

  ctx.fillStyle = COLORS.muted
  ctx.font = font(400, 19)
  ctx.fillText(fitText(ctx, number, identityW), identityX, panel.y + 122)

  // Badge level di bawah nomor.
  ctx.font = font(700, 17)
  const levelText = `${labels.level} ${level}`
  const badgeW = Math.min(identityW, ctx.measureText(levelText).width + 30)
  roundedRectPath(ctx, identityX, panel.y + 142, badgeW, 30, 15)
  ctx.fillStyle = 'rgba(61, 255, 168, 0.16)'
  ctx.fill()
  ctx.strokeStyle = COLORS.accent
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = COLORS.accentSoft
  ctx.textAlign = 'center'
  ctx.fillText(levelText, identityX + badgeW / 2, panel.y + 158)
  ctx.textAlign = 'left'

  // Garis pemisah.
  ctx.beginPath()
  ctx.moveTo(innerX, panel.y + 192)
  ctx.lineTo(innerRight, panel.y + 192)
  ctx.strokeStyle = COLORS.divider
  ctx.lineWidth = 1
  ctx.stroke()

  // Bar XP.
  const xpLabelY = panel.y + 220
  ctx.fillStyle = COLORS.muted
  ctx.font = font(700, 18)
  ctx.fillText(fitText(ctx, labels.xp, 90), innerX, xpLabelY)
  ctx.fillStyle = COLORS.text
  ctx.font = font(700, 18)
  ctx.textAlign = 'right'
  const xpText = `${progress}/${needed} XP (${percent}%)`
  ctx.fillText(fitText(ctx, xpText, innerW - 100), innerRight, xpLabelY)
  ctx.textAlign = 'left'

  const barX = innerX
  const barY = panel.y + 238
  const barW = innerW
  const barH = 22
  roundedRectPath(ctx, barX, barY, barW, barH, 11)
  ctx.fillStyle = COLORS.barTrack
  ctx.fill()
  if (percent > 0) {
    ctx.save()
    roundedRectPath(ctx, barX, barY, barW, barH, 11)
    ctx.clip()
    const fillGradient = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    fillGradient.addColorStop(0, '#1db97a')
    fillGradient.addColorStop(1, COLORS.accent)
    ctx.fillStyle = fillGradient
    ctx.fillRect(barX, barY, (barW * percent) / 100, barH)
    ctx.restore()
  }

  // Kotak saldo dan limit.
  const boxY = panel.y + 282
  const boxH = 92
  const boxGap = 14
  const boxW = (innerW - boxGap) / 2
  const boxes = [
    { label: labels.balance, value: new Intl.NumberFormat('id-ID').format(balance) },
    { label: labels.limit, value: String(limitLeft) },
  ]
  boxes.forEach((box, index) => {
    const boxX = innerX + index * (boxW + boxGap)
    roundedRectPath(ctx, boxX, boxY, boxW, boxH, 16)
    ctx.fillStyle = COLORS.box
    ctx.fill()
    ctx.strokeStyle = COLORS.boxStroke
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = COLORS.muted
    ctx.font = font(700, 14)
    ctx.fillText(fitText(ctx, box.label.toUpperCase(), boxW - 28), boxX + 14, boxY + 26)
    ctx.fillStyle = COLORS.text
    ctx.font = font(700, 30)
    ctx.fillText(fitText(ctx, box.value, boxW - 28), boxX + 14, boxY + 62)
  })

  // Garis pemisah kedua.
  const divider2Y = panel.y + 388
  ctx.beginPath()
  ctx.moveTo(innerX, divider2Y)
  ctx.lineTo(innerRight, divider2Y)
  ctx.strokeStyle = COLORS.divider
  ctx.lineWidth = 1
  ctx.stroke()

  // Gelar atau rank.
  ctx.fillStyle = COLORS.muted
  ctx.font = font(700, 14)
  ctx.fillText(fitText(ctx, labels.rank.toUpperCase(), innerW), innerX, panel.y + 412)
  ctx.fillStyle = COLORS.accentSoft
  ctx.font = font(700, 23)
  ctx.fillText(fitText(ctx, rankLabel, innerW), innerX, panel.y + 440)

  // Tanggal daftar atau status daftar.
  ctx.fillStyle = COLORS.muted
  ctx.font = font(400, 18)
  ctx.fillText(fitText(ctx, registeredLabel, innerW), innerX, panel.y + 472)

  return canvas.toBuffer('image/png')
}
