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
      needSticker: '╭─❏ 🏷️ 「 *BUTUH STIKER* 」\n┊ Kutip stikernya dulu yaa, terus ketik *.toimg*~\n╰━━━━━━━',
      animated: '╭─❏ 🎞️ 「 *ITU STIKER ANIMASI* 」\n┊ Ehh, stiker itu animasi. Pakai *.tovideo* yaa biar gerakannya nggak hilang~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *KEGEDEAN* 」\n┊ Mouu, stikernya kegedean, di atas *16 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL UBAH STIKER* 」\n┊ Mouu, gagal ubah stikernya: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *GAMBAR JADI* 」\n┊ Ini gambarnyaa, stikernya sudah jadi gambar~\n╰━━━━━━━',
    },
  },
  en: {
    toimg: {
      needSticker: '╭─❏ 🏷️ 「 *STICKER NEEDED* 」\n┊ Quote the sticker first, then type *.toimg*~\n╰━━━━━━━',
      animated: '╭─❏ 🎞️ 「 *THAT IS ANIMATED* 」\n┊ Ehh, that sticker is animated. Use *.tovideo* so the motion stays~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *TOO BIG* 」\n┊ Mouu, the sticker is too big, over *16 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *CONVERT FAILED* 」\n┊ Mouu, failed to convert the sticker: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *IMAGE READY* 」\n┊ Here is the image, your sticker is now a picture~\n╰━━━━━━━',
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

export const test = { input: '.toimg', expect: /stiker/i }

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
