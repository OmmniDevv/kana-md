// Ubah ukuran gambar yang dikutip ke lebar x tinggi yang diminta (ffmpeg).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sendImage } from '../../src/ui/media.js'

const run = promisify(execFile)

export const config = {
  name: 'resize',
  alias: ['ubahukuran'],
  category: 'maker',
  description: { id: 'Ubah ukuran gambar yang dikutip, contoh 512x512', en: 'Resize a quoted image, example 512x512' },
  usage: '.resize <lebar>x<tinggi> (balas gambar)',
  example: '.resize 512x512',
  cooldown: 10,
}

export const i18n = {
  id: {
    resize: {
      need: 'Balas gambarnya dan tulis ukurannya yaa, contoh: .resize 512x512. {mood}',
      caption: 'Nih, sudah KANA ubah ke {w}x{h}~ 📐',
      fail: 'Gagal ubah ukurannya: {error}',
    },
  },
  en: {
    resize: {
      need: 'Reply to the image and write the size please, example: .resize 512x512. {mood}',
      caption: 'Here, resized to {w}x{h}~ 📐',
      fail: 'Failed to resize: {error}',
    },
  },
}

export const test = { input: '.resize', expect: /512x512/ }

export async function handler(ctx) {
  const match = (ctx.text || '').match(/(\d{2,4})\s*x\s*(\d{2,4})/)
  const media = await ctx.downloadQuoted().catch(() => null)
  if (!match || !media?.buffer || media.kind !== 'image') {
    return ctx.reply(ctx.t('resize.need', { mood: ctx.say('mikir') }))
  }
  const w = Math.min(4096, Math.max(16, Number(match[1])))
  const h = Math.min(4096, Math.max(16, Number(match[2])))
  const dir = await mkdtemp(join(tmpdir(), 'kana-resize-'))
  try {
    const input = join(dir, 'in.bin')
    const output = join(dir, 'out.png')
    await writeFile(input, media.buffer)
    await run('ffmpeg', ['-y', '-i', input, '-vf', `scale=${w}:${h}`, output], { timeout: 60000 })
    const out = await readFile(output)
    return sendImage(ctx, out, { caption: ctx.t('resize.caption', { w, h }) })
  } catch (err) {
    return ctx.reply(ctx.t('resize.fail', { error: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
