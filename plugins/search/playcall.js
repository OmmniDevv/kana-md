import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { playSong } from '../../src/scrapers/youtube/youtube.js'
import { withTempDir } from '../../src/scrapers/runner.js'
import { MAX_AUDIO_BYTES as RUNNER_MAX } from '../../src/ui/media.js'

const run = promisify(execFile)

// Putar lagu sebagai pesan suara (voice note) bergaya panggilan:
// hasil unduh YouTube dikonversi lokal ke opus ptt dengan ffmpeg.
export const config = {
  name: 'playcall',
  alias: [],
  category: 'search',
  description: { id: 'Putar lagu sebagai voice note (gaya panggilan suara)', en: 'Play a song as a voice note (call style)' },
  usage: '.playcall <judul lagu>',
  example: '.playcall Tulus Sepatu',
  cooldown: 20,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    playcall: {
      needQuery: '╭─❏ 📞 「 *KETIK JUDUL LAGUNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.playcall Tulus Sepatu*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA siapin voice note lagunya... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL PUTAR* 」\n┊ Mouu, gagal putar lagunya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📞 「 *PLAY CALL* 」\n┊ 🎵 *{title}*\n┊ ⏱️ {duration}\n╰━━━━━━━',
    },
  },
  en: {
    playcall: {
      needQuery: '╭─❏ 📞 「 *TYPE THE SONG TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.playcall Tulus Sepatu*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is preparing the song voice note... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO PLAY* 」\n┊ Mouu, failed to play the song: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📞 「 *PLAY CALL* 」\n┊ 🎵 *{title}*\n┊ ⏱️ {duration}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.playcall Tulus Sepatu', expect: /PLAY CALL/ }

export async function toVoiceNote(buffer) {
  return withTempDir('kana-playcall-', async (dir) => {
    const input = join(dir, 'song.mp3')
    const output = join(dir, 'song.ogg')
    await writeFile(input, buffer)
    await run('ffmpeg', ['-y', '-i', input, '-vn', '-c:a', 'libopus', '-b:a', '64k', '-ac', '1', '-ar', '48000', output], { timeout: 120000 })
    return readFile(output)
  })
}

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('playcall.needQuery'))
  await ctx.reply(ctx.t('playcall.working', { mood: ctx.say('mikir') }))
  try {
    const result = await playSong(q, { maxBytes: RUNNER_MAX })
    const note = await toVoiceNote(result.buffer)
    await ctx.sock.sendMessage(ctx.chat, {
      audio: note,
      ptt: true,
      mimetype: 'audio/ogg; codecs=opus',
    }, { quoted: ctx.raw })
    return ctx.reply(ctx.t('playcall.caption', {
      title: result.selected?.title || result.info?.title || q,
      duration: result.selected?.durationText || result.info?.durationText || '-',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('playcall.failed', { message: err.message }))
  }
}
