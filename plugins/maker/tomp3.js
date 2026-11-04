import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendAudio, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { fetchSourceMedia, mediaKindOf } from './sticker.js'

const execFileP = promisify(execFile)

export const config = {
  name: 'tomp3',
  alias: [],
  category: 'maker',
  description: { id: 'Ubah video atau audio yang dikutip jadi MP3', en: 'Turn a quoted video or audio into MP3' },
  usage: '.tomp3 (kutip video/audio)',
  example: '.tomp3',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    tomp3: {
      needMedia: 'Kutip video atau audionya dulu yaa, terus ketik .tomp3~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal ubah ke MP3: {message}~',
    },
  },
  en: {
    tomp3: {
      needMedia: 'Quote a video or audio first, then type .tomp3~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to convert to MP3: {message}~',
    },
  },
}

// audioMessage tidak ditangkap fetchSourceMedia umum, jadi cek sendiri di sini.
async function fetchAudioSource(ctx) {
  const quotedKind = ctx.quoted?.message ? mediaKindOf(ctx.quoted.message) : null
  const quotedAudio = ctx.quoted?.message?.audioMessage
  if (quotedAudio || quotedKind) {
    const buffer = await ctx.downloadQuoted()
    return { kind: quotedAudio ? 'audio' : quotedKind.kind, buffer }
  }
  if (ctx.raw?.message?.audioMessage) return { kind: 'audio', buffer: await ctx.downloadMedia() }
  return fetchSourceMedia(ctx)
}

export async function toMp3(buffer) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.mp3')
    await writeFile(input, buffer)
    try {
      await execFileP('ffmpeg', ['-y', '-i', input, '-vn', '-c:a', 'libmp3lame', '-q:a', '4', out], { timeout: 60000 })
    } catch (err) {
      throw new Error(`ffmpeg tomp3 gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export const test = { input: '.tomp3', expect: /kutip/i }

export async function handler(ctx) {
  let src
  try {
    src = await fetchAudioSource(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('tomp3.failed', { message: err.message }))
  }
  if (!src || !['video', 'audio', 'document'].includes(src.kind)) return ctx.reply(ctx.t('tomp3.needMedia'))
  if (src.buffer.length > MAX_VIDEO_BYTES) return ctx.reply(ctx.t('tomp3.tooBig'))
  try {
    const mp3 = await toMp3(src.buffer)
    await sendAudio(ctx, mp3, { mimetype: 'audio/mpeg', title: 'tomp3' })
  } catch (err) {
    return ctx.reply(ctx.t('tomp3.failed', { message: err.message }))
  }
}
