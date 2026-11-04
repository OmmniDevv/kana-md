import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { fetchSourceMedia } from './sticker.js'

const execFileP = promisify(execFile)

export const config = {
  name: 'toimg',
  alias: ['toimage'],
  category: 'maker',
  description: { id: 'Ubah stiker statis yang dikutip jadi gambar PNG', en: 'Turn a quoted static sticker into a PNG image' },
  usage: '.toimg (kutip stiker)',
  example: '.toimg',
  cooldown: 5,
}

export const i18n = {
  id: {
    toimg: {
      needSticker: 'Kutip stikernya dulu yaa, terus ketik .toimg~',
      animated: 'Ehh, stiker itu animasi. Pakai .tovideo yaa biar gerakannya nggak hilang~',
      tooBig: 'Mouu, stikernya kegedean (di atas 16 MB)~',
      failed: 'Mouu, gagal ubah stikernya: {message}~',
      caption: 'Ini gambarnyaa~',
    },
  },
  en: {
    toimg: {
      needSticker: 'Quote the sticker first, then type .toimg~',
      animated: 'Ehh, that sticker is animated. Use .tovideo so the motion stays~',
      tooBig: 'Mouu, the sticker is too big (over 16 MB)~',
      failed: 'Mouu, failed to convert the sticker: {message}~',
      caption: 'Here is the image~',
    },
  },
}

export async function webpToPng(buffer) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.png')
    await writeFile(input, buffer)
    try {
      await execFileP('ffmpeg', ['-y', '-i', input, '-frames:v', '1', out], { timeout: 30000 })
    } catch (err) {
      throw new Error(`ffmpeg toimg gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export async function handler(ctx) {
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('toimg.failed', { message: err.message }))
  }
  if (!src || src.kind !== 'sticker') return ctx.reply(ctx.t('toimg.needSticker'))
  if (src.node?.isAnimated) return ctx.reply(ctx.t('toimg.animated'))
  if (src.buffer.length > MAX_IMAGE_BYTES) return ctx.reply(ctx.t('toimg.tooBig'))
  try {
    const png = await webpToPng(src.buffer)
    await sendImage(ctx, png, { caption: ctx.t('toimg.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('toimg.failed', { message: err.message }))
  }
}
