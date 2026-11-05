// Tulis teks di gambar kertas bergaris seperti tulisan tangan (canvas).
import { GlobalFonts, createCanvas } from '@napi-rs/canvas'
import { existsSync } from 'node:fs'
import { sendImage } from '../../src/ui/media.js'

const FONT_CANDIDATES = [
  '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
]
let fontReady = false
function ensureFont() {
  if (fontReady) return
  fontReady = true
  if (typeof GlobalFonts?.registerFromPath !== 'function') return
  for (const path of FONT_CANDIDATES) {
    try {
      if (!existsSync(path)) continue
      GlobalFonts.registerFromPath(path, 'KanaNote')
      return
    } catch { /* coba jalur berikutnya */ }
  }
}

export const config = {
  name: 'nulis',
  alias: ['tulis', 'nulisbuku'],
  category: 'maker',
  description: { id: 'Render teks seperti tulisan tangan di kertas bergaris', en: 'Render text like handwriting on lined paper' },
  usage: '.nulis <teks>',
  example: '.nulis Besok jangan lupa bawa buku matematika',
  cooldown: 8,
}

export const i18n = {
  id: { nulis: { hint: '╭─❏ ✏️ 「 *BUTUH TEKS* 」\n┊ Tulis teksnya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.nulis Besok jangan lupa bawa buku matematika*\n╰━━━━━━━', caption: '╭─❏ 📝 「 *TULISAN JADI* 」\n┊ Nih tulisan tangannya, rapi kan~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL NULIS* 」\n┊ Mouu, gagal nulisnya: *{error}*~\n╰━━━━━━━' } },
  en: { nulis: { hint: '╭─❏ ✏️ 「 *TEXT NEEDED* 」\n┊ Write the text please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.nulis Do not forget the math book tomorrow*\n╰━━━━━━━', caption: '╭─❏ 📝 「 *HANDWRITING READY* 」\n┊ Here is the handwriting, neat right~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *WRITING FAILED* 」\n┊ Mouu, failed to write it: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.nulis halo semua, ini tulisan tes KANA', expect: /.+/ }

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = trial
  }
  if (line) lines.push(line)
  return lines.slice(0, 14)
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('nulis.hint'))
  try {
    ensureFont()
    const canvas = createCanvas(900, 620)
    const g = canvas.getContext('2d')
    g.fillStyle = '#fdfdf8'
    g.fillRect(0, 0, 900, 620)
    g.strokeStyle = '#f3b8c6'
    g.beginPath(); g.moveTo(70, 0); g.lineTo(70, 620); g.stroke()
    g.strokeStyle = '#bfd9ea'
    for (let y = 90; y < 620; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(900, y); g.stroke() }
    g.font = 'italic 30px KanaNote, serif'
    g.fillStyle = '#27408f'
    const lines = wrap(g, text.slice(0, 600), 780)
    lines.forEach((line, i) => g.fillText(line, 88, 78 + i * 42))
    return sendImage(ctx, canvas.toBuffer('image/png'), { caption: ctx.t('nulis.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('nulis.fail', { error: err.message }))
  }
}
