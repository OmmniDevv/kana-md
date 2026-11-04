import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { textImage } from '../../src/services/text-image.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { withTempDir } from '../../src/scrapers/runner.js'
import { sendSticker } from './sticker.js'

const execFileP = promisify(execFile)
const FRAME_COLORS = ['magenta', 'cyan', 'yellow']

export const config = {
  name: 'attp',
  alias: [],
  category: 'maker',
  description: { id: 'Bikin stiker teks animasi warna-warni', en: 'Make an animated colorful text sticker' },
  usage: '.attp <teks>',
  example: '.attp keren banget',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    attp: {
      needText: '╭─❏ ✏️ 「 *BUTUH TEKS* 」\n┊ Ketik teksnya dulu yaa, contoh: *.attp keren banget*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL BIKIN ATTP* 」\n┊ Mouu, gagal bikin stiker attp: *{message}*~\n╰━━━━━━━',
      done: '╭─❏ 🎨 「 *STIKER ATTP JADI* 」\n┊ Stiker attpnya jadii, warna-warninya gemas~\n╰━━━━━━━',
    },
  },
  en: {
    attp: {
      needText: '╭─❏ ✏️ 「 *TEXT NEEDED* 」\n┊ Type the text first, example: *.attp so cool*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *ATTP FAILED* 」\n┊ Mouu, failed to make the attp sticker: *{message}*~\n╰━━━━━━━',
      done: '╭─❏ 🎨 「 *ATTP STICKER READY* 」\n┊ Your attp sticker is ready, so colorful~\n╰━━━━━━━',
    },
  },
}

async function animatedWebp(frames) {
  return withTempDir(async (dir) => {
    for (let i = 0; i < frames.length; i++) await writeFile(join(dir, `frame-${i + 1}.png`), frames[i])
    const out = join(dir, 'out.webp')
    const args = [
      '-y', '-framerate', '2', '-i', join(dir, 'frame-%d.png'),
      '-vf', 'scale=512:512,format=rgba',
      '-c:v', 'libwebp', '-lossless', '0', '-quality', '80', '-loop', '0', '-an', out,
    ]
    await execFileP('ffmpeg', args, { timeout: 60000 })
    return readFile(out)
  })
}

export const test = { input: '.attp keren banget', expect: /Stiker attpnya/i }

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('attp.needText'))
  try {
    const frames = []
    for (const color of FRAME_COLORS) {
      frames.push(
        await textImage({
          width: 512,
          height: 512,
          background: '0x111111',
          lines: [{ text, size: 52, color, bold: true, y: 210 }],
        })
      )
    }
    let webp
    try {
      webp = await animatedWebp(frames)
    } catch {
      // Jalur animasi gagal: fallback stiker statis dari frame pertama.
      webp = await toStickerWebp(frames[0], { animated: false })
    }
    await sendSticker(ctx, webp)
    return ctx.reply(ctx.t('attp.done'))
  } catch (err) {
    return ctx.reply(ctx.t('attp.failed', { message: err.message }))
  }
}
