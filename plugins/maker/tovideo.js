import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { fetchSourceMedia } from './sticker.js'

const execFileP = promisify(execFile)

export const config = {
  name: 'tovideo',
  alias: ['tomp4'],
  category: 'maker',
  description: { id: 'Ubah stiker animasi atau video yang dikutip jadi MP4', en: 'Turn a quoted animated sticker or video into MP4' },
  usage: '.tovideo (kutip stiker animasi)',
  example: '.tovideo',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    tovideo: {
      needMedia: '╭─❏ 🎬 「 *BUTUH MEDIA* 」\n┊ Kutip stiker animasi atau videonya dulu yaa, terus ketik *.tovideo*~\n╰━━━━━━━',
      staticHint: '╭─❏ 🖼️ 「 *ITU GAMBAR DIAM* 」\n┊ Itu gambar diam, bukan animasi. Pakai *.toimg* aja yaa~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *KEGEDEAN* 」\n┊ Mouu, medianya kegedean, di atas *64 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL UBAH KE VIDEO* 」\n┊ Mouu, gagal ubah ke video: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *VIDEO JADI* 」\n┊ Ini videonyaa, gerakannya aman~\n╰━━━━━━━',
    },
  },
  en: {
    tovideo: {
      needMedia: '╭─❏ 🎬 「 *MEDIA NEEDED* 」\n┊ Quote an animated sticker or a video first, then type *.tovideo*~\n╰━━━━━━━',
      staticHint: '╭─❏ 🖼️ 「 *THAT IS A STILL IMAGE* 」\n┊ That is a still image, not an animation. Use *.toimg* instead~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *TOO BIG* 」\n┊ Mouu, the media is too big, over *64 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *VIDEO CONVERT FAILED* 」\n┊ Mouu, failed to convert to video: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *VIDEO READY* 」\n┊ Here is the video, the motion is safe~\n╰━━━━━━━',
    },
  },
}

// ffmpeg di sistem ini tidak bisa mendekode WebP animasi (chunk ANIM/ANMF
// dilewati decoder webp bawaannya), jadi frame ANMF diekstrak manual: tiap
// frame dibungkus ulang jadi WebP tunggal yang bisa dibaca ffmpeg, didekode
// ke PNG, lalu dirakit pakai demuxer concat sesuai durasi frame.
// Batasan jujur: frame harus menutupi seluruh kanvas (umum pada stiker
// WhatsApp); frame parsial ditolak dengan error jelas.
export function extractAnimFrames(buffer) {
  if (
    !Buffer.isBuffer(buffer) ||
    buffer.length < 12 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    return null
  }
  let canvas = null
  const frames = []
  let offset = 12
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4)
    const size = buffer.readUInt32LE(offset + 4)
    const data = buffer.subarray(offset + 8, offset + 8 + size)
    if (type === 'VP8X' && data.length >= 10) {
      canvas = { width: data.readUIntLE(4, 3) + 1, height: data.readUIntLE(7, 3) + 1 }
    }
    if (type === 'ANMF' && data.length >= 16) {
      const fx = data.readUIntLE(0, 3) * 2
      const fy = data.readUIntLE(3, 3) * 2
      const fw = data.readUIntLE(6, 3) + 1
      const fh = data.readUIntLE(9, 3) + 1
      const durationMs = data.readUIntLE(12, 3) || 100
      if (fx !== 0 || fy !== 0 || (canvas && (fw !== canvas.width || fh !== canvas.height))) {
        throw new Error('Frame stiker animasi parsial belum didukung untuk .tovideo')
      }
      let alph = null
      let imageChunk = null
      let inner = 16
      while (inner + 8 <= data.length) {
        const itype = data.toString('ascii', inner, inner + 4)
        const isize = data.readUInt32LE(inner + 4)
        const idata = data.subarray(inner + 8, inner + 8 + isize)
        if (itype === 'ALPH') alph = idata
        if (itype === 'VP8 ' || itype === 'VP8L') imageChunk = { type: itype, data: idata }
        inner += 8 + isize + (isize % 2)
      }
      if (!imageChunk) throw new Error('Frame stiker animasi tanpa data gambar')
      const parts = [Buffer.from('WEBP', 'ascii')]
      const pushChunk = (type2, payload) => {
        const head = Buffer.alloc(8)
        head.write(type2, 0, 'ascii')
        head.writeUInt32LE(payload.length, 4)
        parts.push(head, payload)
        if (payload.length % 2) parts.push(Buffer.from([0]))
      }
      if (alph) {
        const vp8x = Buffer.alloc(10)
        vp8x[0] = 0x10
        vp8x.writeUIntLE(fw - 1, 4, 3)
        vp8x.writeUIntLE(fh - 1, 7, 3)
        pushChunk('VP8X', vp8x)
        pushChunk('ALPH', alph)
      }
      pushChunk(imageChunk.type, imageChunk.data)
      const body = Buffer.concat(parts)
      const riff = Buffer.alloc(8)
      riff.write('RIFF', 0, 'ascii')
      riff.writeUInt32LE(body.length, 4)
      frames.push({ webp: Buffer.concat([riff, body]), durationMs })
    }
    offset += 8 + size + (size % 2)
  }
  return frames.length ? frames : null
}

async function animatedWebpToMp4(buffer) {
  const frames = extractAnimFrames(buffer)
  if (!frames) throw new Error('Bukan WebP animasi')
  if (frames.length > 150) throw new Error('Frame stiker terlalu banyak (maks 150)')
  return withTempDir(async (dir) => {
    const listLines = []
    for (let i = 0; i < frames.length; i++) {
      const frameWebp = join(dir, `f${i}.webp`)
      const framePng = join(dir, `f${i}.png`)
      await writeFile(frameWebp, frames[i].webp)
      await execFileP('ffmpeg', ['-y', '-i', frameWebp, '-frames:v', '1', framePng], { timeout: 30000 })
      listLines.push(`file '${framePng}'`, `duration ${(frames[i].durationMs / 1000).toFixed(3)}`)
    }
    listLines.push(`file '${join(dir, `f${frames.length - 1}.png`)}'`)
    const list = join(dir, 'list.txt')
    await writeFile(list, listLines.join('\n'))
    const out = join(dir, 'out.mp4')
    try {
      await execFileP(
        'ffmpeg',
        ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p', '-c:v', 'libx264', '-movflags', '+faststart', out],
        { timeout: 60000 }
      )
    } catch (err) {
      throw new Error(`ffmpeg tovideo gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export async function toMp4(buffer) {
  // WebP animasi (stiker) perlu jalur ekstrak frame; sisanya langsung ffmpeg.
  if (Buffer.isBuffer(buffer) && buffer.toString('ascii', 0, 4) === 'RIFF' && extractAnimFrames(buffer)) {
    return animatedWebpToMp4(buffer)
  }
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.mp4')
    await writeFile(input, buffer)
    const args = [
      '-y', '-i', input,
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', out,
    ]
    try {
      await execFileP('ffmpeg', args, { timeout: 60000 })
    } catch (err) {
      throw new Error(`ffmpeg tovideo gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export const test = { input: '.tovideo', expect: /kutip/i }

export async function handler(ctx) {
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('tovideo.failed', { message: err.message }))
  }
  if (!src) return ctx.reply(ctx.t('tovideo.needMedia'))
  const animated = src.kind === 'video' || (src.kind === 'sticker' && src.node?.isAnimated)
  if (!animated) return ctx.reply(ctx.t('tovideo.staticHint'))
  if (src.buffer.length > MAX_VIDEO_BYTES) return ctx.reply(ctx.t('tovideo.tooBig'))
  try {
    const mp4 = await toMp4(src.buffer)
    await sendVideo(ctx, mp4, { caption: ctx.t('tovideo.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('tovideo.failed', { message: err.message }))
  }
}
