import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'
import { fetchSourceMedia, sendSticker } from './sticker.js'

const execFileP = promisify(execFile)
const FONT_BOLD = process.env.FONT_BOLD_PATH || '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

export const config = {
  name: 'smeme',
  alias: [],
  category: 'maker',
  description: { id: 'Tambah teks atas bawah ke gambar yang dikutip, hasilnya stiker meme', en: 'Add top and bottom text to a quoted image, result is a meme sticker' },
  usage: '.smeme <atas> | <bawah> (kutip gambar)',
  example: '.smeme ketika coding | langsung jalan',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    smeme: {
      needImage: 'Kutip gambarnya dulu yaa, terus ketik .smeme teks atas | teks bawah~',
      needText: 'Ketik teksnya dulu yaa, formatnya: .smeme teks atas | teks bawah~',
      tooBig: 'Mouu, gambar sumbernya kegedean (di atas 16 MB)~',
      failed: 'Mouu, gagal bikin stiker meme: {message}~',
      done: 'Stiker memenya jadii~ Mau lanjut ke mana?',
      menuButton: 'Menu Maker',
    },
  },
  en: {
    smeme: {
      needImage: 'Quote an image first, then type .smeme top text | bottom text~',
      needText: 'Type the text first, format: .smeme top text | bottom text~',
      tooBig: 'Mouu, the source image is too big (over 16 MB)~',
      failed: 'Mouu, failed to make the meme sticker: {message}~',
      done: 'Your meme sticker is ready~ Where to next?',
      menuButton: 'Maker Menu',
    },
  },
}

async function drawMeme(source, top, bottom) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.png')
    await writeFile(input, source)
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
      throw new Error(`ffmpeg smeme gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export async function handler(ctx) {
  const [topRaw, bottomRaw] = ctx.text.split('|').map((s) => (s ?? '').trim())
  const top = topRaw || ''
  const bottom = bottomRaw || ''
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('smeme.failed', { message: err.message }))
  }
  if (!src || !['image', 'sticker', 'document'].includes(src.kind)) return ctx.reply(ctx.t('smeme.needImage'))
  if (src.buffer.length > MAX_IMAGE_BYTES) return ctx.reply(ctx.t('smeme.tooBig'))
  if (!top && !bottom) return ctx.reply(ctx.t('smeme.needText'))
  try {
    const png = await drawMeme(src.buffer, top, bottom)
    const webp = await toStickerWebp(png)
    await sendSticker(ctx, webp)
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('smeme.done'),
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('smeme.menuButton'), id: '.menu maker' }],
      textFallback: ctx.t('smeme.done'),
    })
  } catch (err) {
    return ctx.reply(ctx.t('smeme.failed', { message: err.message }))
  }
}
