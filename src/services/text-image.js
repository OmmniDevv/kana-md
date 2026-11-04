// Pembuat gambar teks berbasis ffmpeg (drawtext), tanpa dependensi native.
// Dipakai kartu welcome, brat/attp/ttp, quotly, carbon, logo maker, dan
// gambar petunjuk kuis. Semua file kerja lewat withTempDir (selalu dibersihkan).
// Font DejaVu tersedia di sistem; path bisa dioverride lewat env FONT_PATH dkk.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../scrapers/runner.js'

const execFileP = promisify(execFile)

const FONT_REGULAR = process.env.FONT_PATH || '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
const FONT_BOLD = process.env.FONT_BOLD_PATH || '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
const FONT_MONO = process.env.FONT_MONO_PATH || '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

// Bungkus teks per lebar perkiraan (lebar glyph rata-rata sekitar 0.55 x size).
export function wrapText(text, maxChars) {
  const limit = Math.max(4, Math.floor(maxChars) || 4)
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    if (word.length > limit) {
      if (current) lines.push(current)
      for (let i = 0; i < word.length; i += limit) lines.push(word.slice(i, i + limit))
      current = ''
      continue
    }
    const next = current ? `${current} ${word}` : word
    if (next.length > limit) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function fontFor(line) {
  if (line.mono) return FONT_MONO
  return line.bold ? FONT_BOLD : FONT_REGULAR
}

// lines: [{ text, size, color, bold, mono, x: 'center'|angka, y: angka }]
// y dihitung otomatis bertumpuk dari margin atas bila tidak diberikan.
// background: string warna hex lavfi (mis. '0x17102B') atau Buffer gambar.
export async function textImage({ lines = [], width = 512, height = 512, background = '0x17102B', format = 'png' } = {}) {
  // Ratakan baris: pecah teks panjang jadi beberapa baris visual.
  const flat = []
  let cursorY = 24
  for (const line of lines) {
    const size = line.size ?? 28
    const maxChars = Math.max(4, Math.floor((width - 32) / (size * 0.55)))
    const wrapped = String(line.text ?? '').split('\n').flatMap((part) => wrapText(part, maxChars))
    for (const text of wrapped) {
      const y = line.y !== undefined && text === wrapped[0] ? line.y : cursorY
      flat.push({ ...line, text, size, y })
      cursorY = y + Math.ceil(size * 1.35)
    }
  }

  return withTempDir(async (dir) => {
    const filters = []
    for (let i = 0; i < flat.length; i++) {
      const line = flat[i]
      const file = join(dir, `line-${i}.txt`)
      await writeFile(file, line.text)
      const x = line.x === undefined || line.x === 'center' ? '(w-text_w)/2' : String(line.x)
      filters.push(
        `drawtext=fontfile=${fontFor(line)}:textfile=${file}:fontsize=${line.size}:fontcolor=${line.color ?? 'white'}:x=${x}:y=${line.y}`
      )
    }
    const out = join(dir, `out.${format}`)
    const args = ['-y']
    if (Buffer.isBuffer(background)) {
      const bgPath = join(dir, 'bg.img')
      await writeFile(bgPath, background)
      args.push('-i', bgPath)
      filters.unshift(`scale=${width}:${height}:force_original_aspect_ratio=increase`, `crop=${width}:${height}`)
    } else {
      args.push('-f', 'lavfi', '-i', `color=c=${background}:s=${width}x${height}`)
    }
    args.push('-vf', filters.join(','), '-frames:v', '1', out)
    try {
      await execFileP('ffmpeg', args, { timeout: 30000 })
    } catch (err) {
      throw new Error(`ffmpeg text-image gagal: ${(err.stderr || err.message).slice(-300)}`)
    }
    return readFile(out)
  })
}
