import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { fetchSourceMedia } from './sticker.js'

const execFileP = promisify(execFile)

export const config = {
  name: 'hd',
  limitGroup: 'upscale',
  alias: ['enhance', 'enhancehd', 'remini'],
  category: 'maker',
  description: { id: 'Perbesar gambar yang dikutip 2x (perbesaran biasa, bukan AI)', en: 'Upscale a quoted image 2x (plain upscaling, not AI)' },
  usage: '.hd (kutip gambar)',
  example: '.hd',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    hd: {
      needImage: '╭─❏ 🖼️ 「 *BUTUH GAMBAR* 」\n┊ Kutip gambarnya dulu yaa, terus ketik *.hd*~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *KEGEDEAN* 」\n┊ Mouu, gambarnya kegedean, di atas *16 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL PERBESAR* 」\n┊ Mouu, gagal perbesar gambarnya: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ ✨ 「 *PERBESARAN JADI* 」\n┊ Ini hasil perbesarannyaa. Catatan jujur: ini perbesaran biasa *2x* pakai lanczos plus penajaman ringan, bukan AI, jadi detail baru nggak bakal muncul~\n╰━━━━━━━',
    },
  },
  en: {
    hd: {
      needImage: '╭─❏ 🖼️ 「 *IMAGE NEEDED* 」\n┊ Quote an image first, then type *.hd*~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *TOO BIG* 」\n┊ Mouu, the image is too big, over *16 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *UPSCALE FAILED* 」\n┊ Mouu, failed to upscale the image: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ ✨ 「 *UPSCALE READY* 」\n┊ Here is the upscaled result. Honest note: this is a plain *2x* upscale with lanczos plus light sharpening, not AI, so no new detail will appear~\n╰━━━━━━━',
    },
  },
}

export async function upscale2x(buffer) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.jpg')
    await writeFile(input, buffer)
    try {
      await execFileP(
        'ffmpeg',
        ['-y', '-i', input, '-vf', 'scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.8:5:5:0.0', '-q:v', '3', '-frames:v', '1', out],
        { timeout: 60000 }
      )
    } catch (err) {
      throw new Error(`ffmpeg hd gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export const test = { input: '.hd', expect: /gambar/i }

export async function handler(ctx) {
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('hd.failed', { message: err.message }))
  }
  if (!src || !['image', 'sticker'].includes(src.kind)) return ctx.reply(ctx.t('hd.needImage'))
  if (src.buffer.length > MAX_IMAGE_BYTES) return ctx.reply(ctx.t('hd.tooBig'))
  try {
    const jpg = await upscale2x(src.buffer)
    await sendImage(ctx, jpg, { caption: ctx.t('hd.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('hd.failed', { message: err.message }))
  }
}
