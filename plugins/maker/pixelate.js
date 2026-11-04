import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'
import { fetchSourceMedia } from './sticker.js'

const execFileP = promisify(execFile)

export const config = {
  name: 'pixelate',
  alias: ['piksel'],
  category: 'maker',
  description: { id: 'Buat gambar yang dikutip jadi pixelated (sensor kotak kotak)', en: 'Pixelate the quoted image (blocky censor style)' },
  usage: '.pixelate [level 4-40] (kutip gambar)',
  example: '.pixelate 16',
  cooldown: 8,
}

export const i18n = {
  id: {
    pixelate: {
      needImage: 'Kutip gambarnya dulu yaa, terus ketik .pixelate~',
      caption: 'Pixelate level {level} jadii~ {mood}',
      failed: 'Mouu, gagal pixelate gambarnya: {message}~',
    },
  },
  en: {
    pixelate: {
      needImage: 'Quote the image first, then type .pixelate~',
      caption: 'Pixelate level {level} is ready~ {mood}',
      failed: 'Mouu, failed to pixelate the image: {message}~',
    },
  },
}

export const test = { input: '.pixelate', expect: /kutip|quote|gambar|image/i }

export async function pixelate(buffer, level = 16) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.img')
    const out = join(dir, 'out.png')
    await writeFile(input, buffer)
    const filter = `scale=iw/${level}:ih/${level}:flags=neighbor,scale=iw*${level}:ih*${level}:flags=neighbor`
    try {
      await execFileP('ffmpeg', ['-y', '-i', input, '-vf', filter, '-frames:v', '1', out], { timeout: 45000 })
    } catch (err) {
      throw new Error(`ffmpeg pixelate gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export async function handler(ctx) {
  let src = null
  try { src = await fetchSourceMedia(ctx) } catch { src = null }
  if (!src || src.kind !== 'image') return ctx.reply(ctx.t('pixelate.needImage'))
  const levelRaw = parseInt(ctx.text || '', 10)
  const level = Number.isFinite(levelRaw) ? Math.max(4, Math.min(40, levelRaw)) : 16
  try {
    const out = await pixelate(src.buffer, level)
    return sendImage(ctx, out, { caption: ctx.t('pixelate.caption', { level, mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('pixelate.failed', { message: err.message }))
  }
}
