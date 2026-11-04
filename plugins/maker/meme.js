import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'
import { fetchSourceMedia } from './sticker.js'

const execFileP = promisify(execFile)
const FONT_BOLD = process.env.FONT_BOLD_PATH || '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

export const config = {
  name: 'meme',
  alias: [],
  category: 'maker',
  description: { id: 'Tambah teks atas dan bawah ke gambar jadi meme', en: 'Add top and bottom text to an image to make a meme' },
  usage: '.meme <atas> | <bawah> (kutip gambar, opsional)',
  example: '.meme ketika coding | langsung jalan',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    meme: {
      needText: 'Ketik teksnya dulu yaa, formatnya: .meme teks atas | teks bawah~',
      tooBig: 'Mouu, gambar sumbernya kegedean (di atas 16 MB)~',
      failed: 'Mouu, gagal bikin meme: {message}~',
      caption: 'Memenya jadii~',
      done: 'Memenya jadii~',
      menuButton: 'Menu Maker',
    },
  },
  en: {
    meme: {
      needText: 'Type the text first, format: .meme top text | bottom text~',
      tooBig: 'Mouu, the source image is too big (over 16 MB)~',
      failed: 'Mouu, failed to make the meme: {message}~',
      caption: 'Your meme is ready~',
      done: 'Your meme is ready~',
      menuButton: 'Maker Menu',
    },
  },
}

async function solidBackground(dir) {
  const bg = join(dir, 'bg.png')
  await execFileP('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'color=c=0x2A0A4A:s=512x512', '-frames:v', '1', bg], {
    timeout: 30000,
  })
  return readFile(bg)
}

async function drawMeme(source, top, bottom) {
  return withTempDir(async (dir) => {
    let bgBuffer = source
    if (!bgBuffer) bgBuffer = await solidBackground(dir)
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.png')
    await writeFile(input, bgBuffer)
    const filters = []
    if (top) {
      const file = join(dir, 'top.txt')
      await writeFile(file, top.toUpperCase())
      filters.push(
        `drawtext=fontfile=${FONT_BOLD}:textfile=${file}:fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=18`
      )
    }
    if (bottom) {
      const file = join(dir, 'bottom.txt')
      await writeFile(file, bottom.toUpperCase())
      filters.push(
        `drawtext=fontfile=${FONT_BOLD}:textfile=${file}:fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-text_h-18`
      )
    }
    if (!filters.length) filters.push('null')
    try {
      await execFileP('ffmpeg', ['-y', '-i', input, '-vf', filters.join(','), '-frames:v', '1', out], { timeout: 30000 })
    } catch (err) {
      throw new Error(`ffmpeg meme gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export const test = { input: '.meme', expect: /teks/i }

export async function handler(ctx) {
  const [topRaw, bottomRaw] = ctx.text.split('|').map((s) => (s ?? '').trim())
  const top = topRaw || ''
  const bottom = bottomRaw || ''
  if (!top && !bottom) return ctx.reply(ctx.t('meme.needText'))
  let source = null
  try {
    const src = await fetchSourceMedia(ctx)
    if (src && ['image', 'sticker', 'document'].includes(src.kind)) {
      if (src.buffer.length > MAX_IMAGE_BYTES) return ctx.reply(ctx.t('meme.tooBig'))
      source = src.buffer
    }
  } catch {
    source = null
  }
  try {
    const png = await drawMeme(source, top, bottom)
    await sendImage(ctx, png, { caption: ctx.t('meme.caption') })
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('meme.done'),
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('meme.menuButton'), id: '.menu maker' }],
      textFallback: ctx.t('meme.done'),
    })
  } catch (err) {
    return ctx.reply(ctx.t('meme.failed', { message: err.message }))
  }
}
