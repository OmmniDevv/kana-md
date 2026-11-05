// Ubah ukuran gambar yang dikutip ke lebar x tinggi yang diminta (ffmpeg).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sendImage, normalizeDownloadedMedia } from '../../src/ui/media.js'

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
      need: '╭─❏ 📐 「 *BUTUH GAMBAR DAN UKURAN* 」\n┊ Balas gambarnya dan tulis ukurannya yaa, contoh: *.resize 512x512* {mood}\n╰━━━━━━━',
      caption: '╭─❏ 📐 「 *UKURAN DIUBAH* 」\n┊ Nih, sudah KANA ubah ke *{w}x{h}*~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL UBAH UKURAN* 」\n┊ Mouu, gagal ubah ukurannya: *{error}*~\n╰━━━━━━━',
    },
  },
  en: {
    resize: {
      need: '╭─❏ 📐 「 *IMAGE AND SIZE NEEDED* 」\n┊ Reply to the image and write the size please, example: *.resize 512x512* {mood}\n╰━━━━━━━',
      caption: '╭─❏ 📐 「 *RESIZED* 」\n┊ Here, resized to *{w}x{h}*~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *RESIZE FAILED* 」\n┊ Mouu, failed to resize: *{error}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.resize 512x512', expect: /BUTUH GAMBAR DAN UKURAN|IMAGE AND SIZE NEEDED/ }

export async function handler(ctx) {
  const match = (ctx.text || '').match(/(\d{2,4})\s*x\s*(\d{2,4})/)
  const media = normalizeDownloadedMedia(await ctx.downloadQuoted().catch(() => null), ctx.quoted?.message)
  if (!match || !media || media.kind !== 'image') {
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
