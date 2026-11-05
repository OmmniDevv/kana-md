import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendVideo } from '../../src/ui/media.js'

const run = promisify(execFile)

// Ubah lebar video ke ukuran target (bawaan 720) dengan ffmpeg lokal,
// tinggi mengikuti rasio aslinya.
export const config = {
  name: 'resizevideo',
  alias: ['resizevid', 'kecilkanvideo'],
  category: 'tools',
  description: { id: 'Ubah ukuran video ke lebar tertentu (ffmpeg lokal)', en: 'Resize a video to a target width (local ffmpeg)' },
  usage: '.resizevideo [lebar]',
  example: '.resizevideo 480',
  cooldown: 30,
  limit: 1,
}

export const i18n = {
  id: {
    resizevideo: {
      needMedia: '╭─❏ 📐 「 *KIRIM ATAU KUTIP VIDEONYA* 」\n┊ ᴄᴏɴᴛᴏʜ: ᴋɪʀɪᴍ ᴠɪᴅᴇᴏ ᴅᴇɴɢᴀɴ ᴄᴀᴘᴛɪᴏɴ *.resizevideo 480*\n┊ ᴛᴀɴᴘᴀ ᴀɴɢᴋᴀ ʙᴇʀᴀʀᴛɪ ʟᴇʙᴀʀ 720.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ubah ukuran videonya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL UBAH UKURAN* 」\n┊ Mouu, gagal ubah ukuran videonya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📐 「 *RESIZE {w}px* 」\n┊ ʟᴇʙᴀʀ ᴠɪᴅᴇᴏ ᴅɪᴜʙᴀʜ ᴋᴇ *{w}px*~\n╰━━━━━━━',
    },
  },
  en: {
    resizevideo: {
      needMedia: '╭─❏ 📐 「 *SEND OR QUOTE A VIDEO* 」\n┊ ᴇxᴀᴍᴘʟᴇ: ꜱᴇɴᴅ ᴀ ᴠɪᴅᴇᴏ ᴡɪᴛʜ ᴄᴀᴘᴛɪᴏɴ *.resizevideo 480*\n┊ ɴᴏ ɴᴜᴍʙᴇʀ ᴍᴇᴀɴꜱ 720 ᴡɪᴅᴛʜ.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is resizing the video... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *RESIZE FAILED* 」\n┊ Mouu, failed to resize the video: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📐 「 *RESIZE {w}px* 」\n┊ ᴠɪᴅᴇᴏ ᴡɪᴅᴛʜ ᴄʜᴀɴɢᴇᴅ ᴛᴏ *{w}px*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.resizevideo 480', expect: /RESIZE|VIDEO/ }

const ALLOWED_WIDTHS = [144, 240, 360, 480, 720, 1080]

// Tentukan lebar target dari argumen, dibulatkan ke tangga terdekat.
export function targetWidth(text) {
  const n = Number(String(text || '').trim().split(/\s+/)[0])
  if (!Number.isFinite(n) || n <= 0) return 720
  let best = ALLOWED_WIDTHS[0]
  for (const w of ALLOWED_WIDTHS) if (Math.abs(w - n) < Math.abs(best - n)) best = w
  return best
}

export async function resizeVideo(buffer, width) {
  return withTempDir('kana-resizevid-', async (dir) => {
    const input = join(dir, 'in.mp4')
    const output = join(dir, 'out.mp4')
    await writeFile(input, buffer)
    await run('ffmpeg', ['-y', '-i', input, '-vf', `scale=${width}:-2`, '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-c:a', 'copy', '-movflags', '+faststart', output], { timeout: 600000 })
    return readFile(output)
  })
}

export async function handler(ctx) {
  let media
  try {
    media = await ctx.downloadMedia()
  } catch {}
  if (!media?.buffer || media.kind !== 'video') return ctx.reply(ctx.t('resizevideo.needMedia'))
  const width = targetWidth(ctx.text || '')
  await ctx.reply(ctx.t('resizevideo.working', { mood: ctx.say('mikir') }))
  try {
    const out = await resizeVideo(media.buffer, width)
    await sendVideo(ctx, out, { caption: ctx.t('resizevideo.caption', { w: width }) })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('resizevideo.failed', { message: err.message }))
  }
}
