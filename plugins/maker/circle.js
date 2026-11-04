import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'
import { fetchSourceMedia } from './sticker.js'

const execFileP = promisify(execFile)

export const config = {
  name: 'circle',
  alias: [],
  category: 'maker',
  description: { id: 'Potong gambar yang dikutip jadi lingkaran transparan', en: 'Crop a quoted image into a transparent circle' },
  usage: '.circle (kutip gambar)',
  example: '.circle',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    circle: {
      needImage: 'Kutip gambarnya dulu yaa, terus ketik .circle~',
      tooBig: 'Mouu, gambarnya kegedean (di atas 16 MB)~',
      failed: 'Mouu, jujur yaa, KANA gagal motong lingkarannya kali ini: {message}. Coba gambar lain atau pakai .hd dulu yaa~',
      caption: 'Ini gambar lingkarannyaa, pinggirnya transparan~ ⭕✨',
      btnHd: 'Perbesar HD',
      btnMenu: 'Menu Maker',
    },
  },
  en: {
    circle: {
      needImage: 'Quote an image first, then type .circle~',
      tooBig: 'Mouu, the image is too big (over 16 MB)~',
      failed: 'Mouu, honestly, KANA failed to cut the circle this time: {message}. Try another image or use .hd first~',
      caption: 'Here is your circle image, the edges are transparent~ ⭕✨',
      btnHd: 'Upscale HD',
      btnMenu: 'Maker Menu',
    },
  },
}

// Potong kotak tengah lalu buat alpha melingkar pakai geq: piksel di dalam
// lingkaran (jarak dari pusat <= setengah lebar) dibuat opak, sisanya 0.
export async function circleCrop(buffer) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.png')
    await writeFile(input, buffer)
    const filter =
      "format=rgba,crop=min(iw\\,ih):min(iw\\,ih),geq=r='r(X\\,Y)':g='g(X\\,Y)':b='b(X\\,Y)':a='if(lte(hypot(X-W/2\\,Y-H/2)\\,W/2)\\,255\\,0)'"
    try {
      await execFileP('ffmpeg', ['-y', '-i', input, '-vf', filter, '-frames:v', '1', out], { timeout: 60000 })
    } catch (err) {
      throw new Error(`ffmpeg circle gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export async function handler(ctx) {
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('circle.failed', { message: err.message }))
  }
  if (!src || !['image', 'sticker'].includes(src.kind)) return ctx.reply(ctx.t('circle.needImage'))
  if (src.buffer.length > MAX_IMAGE_BYTES) return ctx.reply(ctx.t('circle.tooBig'))
  try {
    const png = await circleCrop(src.buffer)
    await sendImage(ctx, png, { caption: ctx.t('circle.caption') })
  } catch (err) {
    const body = ctx.t('circle.failed', { message: err.message })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [
        { text: ctx.t('circle.btnHd'), id: '.hd' },
        { text: ctx.t('circle.btnMenu'), id: '.menu maker' },
      ],
      textFallback: body,
    })
  }
}
