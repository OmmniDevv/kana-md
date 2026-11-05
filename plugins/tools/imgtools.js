import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

const run = promisify(execFile)

// Kotak alat gambar lokal berbasis ffmpeg: info dimensi, abu-abu,
// blur, putar, flip, flop, dan negasi atas gambar yang dikirim/dikutip.
export const config = {
  name: 'imgtools',
  alias: ['imagetools', 'editimg'],
  category: 'tools',
  description: { id: 'Alat gambar: info, abu-abu, blur, putar, flip, negasi (ffmpeg lokal)', en: 'Image tools: info, grayscale, blur, rotate, flip, negate (local ffmpeg)' },
  usage: '.imgtools <info/abu/blur/putar/flip/flop/negasi>',
  example: '.imgtools abu',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    imgtools: {
      needMedia: '╭─❏ 🛠️ 「 *KIRIM ATAU KUTIP GAMBARNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: ᴋɪʀɪᴍ ɢᴀᴍʙᴀʀ ᴅᴇɴɢᴀɴ ᴄᴀᴘᴛɪᴏɴ *.imgtools abu*\n┊ ᴏᴘꜱɪ: *info*, *abu*, *blur*, *putar*, *flip*, *flop*, *negasi*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA olah gambarnya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL OLAH GAMBAR* 」\n┊ Mouu, gagal olah gambarnya: *{message}*\n╰━━━━━━━',
      infoOut: '╭─❏ 🛠️ 「 *INFO GAMBAR* 」\n┊ ꜰᴏʀᴍᴀᴛ: *{codec}*\n┊ ᴅɪᴍᴇɴꜱɪ: *{w} x {h}*\n┊ ᴜᴋᴜʀᴀɴ: *{size}*\n╰━━━━━━━',
      caption: '╭─❏ 🛠️ 「 *IMGTOOLS: {op}* 」\n╰━━━━━━━',
    },
  },
  en: {
    imgtools: {
      needMedia: '╭─❏ 🛠️ 「 *SEND OR QUOTE AN IMAGE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: ꜱᴇɴᴅ ᴀɴ ɪᴍᴀɢᴇ ᴡɪᴛʜ ᴄᴀᴘᴛɪᴏɴ *.imgtools abu*\n┊ ᴏᴘᴛɪᴏɴꜱ: *info*, *abu* (gray), *blur*, *putar* (rotate), *flip*, *flop*, *negasi* (negate)\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is processing the image... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *IMAGE PROCESSING FAILED* 」\n┊ Mouu, failed to process the image: *{message}*\n╰━━━━━━━',
      infoOut: '╭─❏ 🛠️ 「 *IMAGE INFO* 」\n┊ ꜰᴏʀᴍᴀᴛ: *{codec}*\n┊ ᴅɪᴍᴇɴꜱɪᴏɴꜱ: *{w} x {h}*\n┊ ꜱɪᴢᴇ: *{size}*\n╰━━━━━━━',
      caption: '╭─❏ 🛠️ 「 *IMGTOOLS: {op}* 」\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.imgtools abu', expect: /IMGTOOLS/ }

const FILTERS = {
  abu: 'hue=s=0',
  grayscale: 'hue=s=0',
  blur: 'boxblur=8:1',
  putar: 'transpose=1',
  rotate: 'transpose=1',
  flip: 'vflip',
  flop: 'hflip',
  negasi: 'negate',
  negate: 'negate',
}

// Info gambar lewat ffprobe.
export async function probeImage(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,codec_name', '-of', 'json', file], { timeout: 30000 })
  const stream = JSON.parse(stdout)?.streams?.[0]
  if (!stream) throw new Error('stream gambar tidak ditemukan')
  return { codec: stream.codec_name, w: stream.width, h: stream.height }
}

export async function handler(ctx) {
  const op = (ctx.text || '').trim().toLowerCase().split(/\s+/)[0] || 'info'
  let media
  try {
    media = await ctx.downloadMedia()
  } catch {}
  if (!media?.buffer) return ctx.reply(ctx.t('imgtools.needMedia'))
  await ctx.reply(ctx.t('imgtools.working', { mood: ctx.say('mikir') }))
  try {
    const result = await withTempDir('kana-imgtools-', async (dir) => {
      const input = join(dir, 'in.img')
      await writeFile(input, media.buffer)
      if (op === 'info') {
        const info = await probeImage(input)
        return { kind: 'info', info }
      }
      const filter = FILTERS[op] || FILTERS.abu
      const output = join(dir, 'out.png')
      await run('ffmpeg', ['-y', '-i', input, '-vf', filter, output], { timeout: 60000 })
      return { kind: 'image', buffer: await readFile(output) }
    })
    if (result.kind === 'info') {
      return ctx.reply(ctx.t('imgtools.infoOut', {
        ...result.info,
        size: (media.buffer.length / 1024).toFixed(1) + ' KB',
      }))
    }
    await sendImage(ctx, result.buffer, { caption: ctx.t('imgtools.caption', { op }) })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('imgtools.failed', { message: err.message }))
  }
}
