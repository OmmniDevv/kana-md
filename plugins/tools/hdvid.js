import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

const run = promisify(execFile)

// Naikkan resolusi video 2x secara lokal dengan ffmpeg (scale lanczos).
// Bukan AI upscaler; ketajaman bertambah sebatas interpolasi.
export const config = {
  name: 'hdvid',
  alias: ['hdvideo', 'upvid'],
  category: 'tools',
  description: { id: 'Naikkan resolusi video 2x dengan ffmpeg lokal', en: 'Upscale a video 2x with local ffmpeg' },
  usage: '.hdvid',
  example: '.hdvid',
  cooldown: 30,
  limit: 1,
}

export const i18n = {
  id: {
    hdvid: {
      needMedia: '╭─❏ 🎬 「 *KIRIM ATAU KUTIP VIDEONYA* 」\n┊ ᴄᴏɴᴛᴏʜ: ᴋɪʀɪᴍ ᴠɪᴅᴇᴏ ᴅᴇɴɢᴀɴ ᴄᴀᴘᴛɪᴏɴ *.hdvid*\n┊ ᴠɪᴅᴇᴏ ᴀᴋᴀɴ ᴅɪɴᴀɪᴋᴋᴀɴ ʀᴇꜱᴏʟᴜꜱɪɴʏᴀ 2x ᴘᴀᴋᴀɪ ꜰꜰᴍᴘᴇɢ.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA naikkan resolusi videonya, agak lama ya... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL PROSES VIDEO* 」\n┊ Mouu, gagal proses videonya: *{message}*\n┊ ᴄᴏʙᴀ ᴠɪᴅᴇᴏ ʏᴀɴɢ ʟᴇʙɪʜ ᴘᴇɴᴅᴇᴋ ʏᴀ~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *HD VID (2x)* 」\n┊ ʀᴇꜱᴏʟᴜꜱɪ ᴅɪɴᴀɪᴋᴋᴀɴ 2x ᴅᴀʀɪ ᴀꜱʟɪɴʏᴀ~\n╰━━━━━━━',
    },
  },
  en: {
    hdvid: {
      needMedia: '╭─❏ 🎬 「 *SEND OR QUOTE A VIDEO* 」\n┊ ᴇxᴀᴍᴘʟᴇ: ꜱᴇɴᴅ ᴀ ᴠɪᴅᴇᴏ ᴡɪᴛʜ ᴄᴀᴘᴛɪᴏɴ *.hdvid*\n┊ ᴛʜᴇ ᴠɪᴅᴇᴏ ʀᴇꜱᴏʟᴜᴛɪᴏɴ ᴡɪʟʟ ʙᴇ ᴜᴘꜱᴄᴀʟᴇᴅ 2x ᴡɪᴛʜ ꜰꜰᴍᴘᴇɢ.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is upscaling the video, this takes a while... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *VIDEO PROCESSING FAILED* 」\n┊ Mouu, failed to process the video: *{message}*\n┊ ᴛʀʏ ᴀ ꜱʜᴏʀᴛᴇʀ ᴠɪᴅᴇᴏ~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *HD VID (2x)* 」\n┊ ʀᴇꜱᴏʟᴜᴛɪᴏɴ ᴜᴘꜱᴄᴀʟᴇᴅ 2x ꜰʀᴏᴍ ᴛʜᴇ ᴏʀɪɢɪɴᴀʟ~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.hdvid', expect: /VIDEO|VID/ }

export async function upscaleVideo(buffer) {
  return withTempDir('kana-hdvid-', async (dir) => {
    const input = join(dir, 'in.mp4')
    const output = join(dir, 'out.mp4')
    await writeFile(input, buffer)
    await run('ffmpeg', ['-y', '-i', input, '-vf', 'scale=iw*2:ih*2:flags=lanczos', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-c:a', 'copy', '-movflags', '+faststart', output], { timeout: 600000 })
    return readFile(output)
  })
}

export async function handler(ctx) {
  let media
  try {
    media = await ctx.downloadMedia()
  } catch {}
  if (!media?.buffer || media.kind !== 'video') return ctx.reply(ctx.t('hdvid.needMedia'))
  if (media.buffer.length > MAX_VIDEO_BYTES) return ctx.reply(ctx.t('hdvid.failed', { message: 'video terlalu besar' }))
  await ctx.reply(ctx.t('hdvid.working', { mood: ctx.say('mikir') }))
  try {
    const out = await upscaleVideo(media.buffer)
    await sendVideo(ctx, out, { caption: ctx.t('hdvid.caption') })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('hdvid.failed', { message: err.message }))
  }
}
