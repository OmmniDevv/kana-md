import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { fetchSourceMedia, mediaKindOf } from './sticker.js'

const execFileP = promisify(execFile)

export const config = {
  name: 'tovn',
  alias: ['toptt', 'ptv', 'videobulet'],
  category: 'maker',
  description: { id: 'Ubah audio atau video yang dikutip jadi voice note', en: 'Turn a quoted audio or video into a voice note' },
  usage: '.tovn (kutip audio/video)',
  example: '.tovn',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    tovn: {
      needMedia: '╭─❏ 🎤 「 *BUTUH MEDIA* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.tovn*~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *KEGEDEAN* 」\n┊ Mouu, medianya kegedean, di atas *64 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL UBAH KE VOICE NOTE* 」\n┊ Mouu, gagal ubah ke voice note: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    tovn: {
      needMedia: '╭─❏ 🎤 「 *MEDIA NEEDED* 」\n┊ Quote an audio or video first, then type *.tovn*~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *TOO BIG* 」\n┊ Mouu, the media is too big, over *64 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *VOICE NOTE FAILED* 」\n┊ Mouu, failed to convert to a voice note: *{message}*~\n╰━━━━━━━',
    },
  },
}

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

export async function toVoiceNote(buffer) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.ogg')
    await writeFile(input, buffer)
    try {
      await execFileP(
        'ffmpeg',
        ['-y', '-i', input, '-vn', '-c:a', 'libopus', '-b:a', '64k', '-ac', '1', '-ar', '48000', out],
        { timeout: 60000 }
      )
    } catch (err) {
      throw new Error(`ffmpeg tovn gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export const test = { input: '.tovn', expect: /kutip/i }

export async function handler(ctx) {
  let src
  try {
    src = await fetchAudioSource(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('tovn.failed', { message: err.message }))
  }
  if (!src || !['video', 'audio', 'document'].includes(src.kind)) return ctx.reply(ctx.t('tovn.needMedia'))
  if (src.buffer.length > MAX_VIDEO_BYTES) return ctx.reply(ctx.t('tovn.tooBig'))
  try {
    const ogg = await toVoiceNote(src.buffer)
    await ctx.sock.sendMessage(
      ctx.chat,
      { audio: ogg, ptt: true, mimetype: 'audio/ogg; codecs=opus' },
      { quoted: ctx.raw }
    )
  } catch (err) {
    return ctx.reply(ctx.t('tovn.failed', { message: err.message }))
  }
}
