// Baca metadata EXIF/media dari gambar atau video yang dikutip (ffprobe).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = promisify(execFile)
import { smallCaps } from '../../src/config/templates.js'

export const config = {
  name: 'getexif',
  alias: ['exif', 'metadata'],
  category: 'maker',
  description: { id: 'Lihat metadata media yang dikutip: ukuran, durasi, kamera, GPS bila ada', en: 'See metadata of quoted media: size, duration, camera, GPS when present' },
  usage: '.getexif (balas gambar/video)',
  example: '.getexif',
  cooldown: 10,
}

export const i18n = {
  id: {
    getexif: {
      need: '╭─❏ 🔍 「 *BUTUH MEDIA* 」\n┊ Balas gambar atau video yang mau dicek metadatanya yaa~ {mood}\n╰━━━━━━━',
      head: '╭─❏ 🔍 「 *METADATA MEDIA* 」',
      format: '┊ ꜰᴏʀᴍᴀᴛ: *{format}*',
      size: '┊ ᴜᴋᴜʀᴀɴ: *{size}*',
      duration: '┊ ᴅᴜʀᴀꜱɪ: *{duration} detik*',
      dimension: '┊ ᴅɪᴍᴇɴꜱɪ: *{w}x{h}*',
      tag: '┊ {key}: *{value}*',
      none: '┊ Tidak ada metadata tambahan di media ini.',
      foot: '╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL BACA METADATA* 」\n┊ Mouu, gagal baca metadatanya: *{error}*~\n╰━━━━━━━',
    },
  },
  en: {
    getexif: {
      need: '╭─❏ 🔍 「 *MEDIA NEEDED* 」\n┊ Reply to an image or video to inspect its metadata please~ {mood}\n╰━━━━━━━',
      head: '╭─❏ 🔍 「 *MEDIA METADATA* 」',
      format: '┊ ꜰᴏʀᴍᴀᴛ: *{format}*',
      size: '┊ ꜱɪᴢᴇ: *{size}*',
      duration: '┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration} seconds*',
      dimension: '┊ ᴅɪᴍᴇɴꜱɪᴏɴꜱ: *{w}x{h}*',
      tag: '┊ {key}: *{value}*',
      none: '┊ No extra metadata in this media.',
      foot: '╰━━━━━━━',
      fail: '╭─❏ 💦 「 *METADATA FAILED* 」\n┊ Mouu, failed to read the metadata: *{error}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.getexif', expect: /balas|reply/i }

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export async function handler(ctx) {
  const media = await ctx.downloadQuoted().catch(() => null)
  if (!media?.buffer) return ctx.reply(ctx.t('getexif.need', { mood: ctx.say('mikir') }))
  const dir = await mkdtemp(join(tmpdir(), 'kana-exif-'))
  try {
    const input = join(dir, 'media')
    await writeFile(input, media.buffer)
    const { stdout } = await run('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', input], { timeout: 30000 })
    const probe = JSON.parse(stdout)
    const lines = [ctx.t('getexif.head'), ctx.t('getexif.format', { format: probe.format?.format_long_name ?? '-' }), ctx.t('getexif.size', { size: humanSize(media.buffer.length) })]
    if (probe.format?.duration) lines.push(ctx.t('getexif.duration', { duration: Number(probe.format.duration).toFixed(1) }))
    const video = (probe.streams ?? []).find((s) => s.codec_type === 'video')
    if (video?.width) lines.push(ctx.t('getexif.dimension', { w: video.width, h: video.height }))
    const tags = Object.entries(probe.format?.tags ?? {}).slice(0, 12)
    if (tags.length) for (const [key, value] of tags) lines.push(ctx.t('getexif.tag', { key: smallCaps(key), value: String(value).slice(0, 120) }))
    else lines.push(ctx.t('getexif.none'))
    lines.push(ctx.t('getexif.foot'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('getexif.fail', { error: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
