import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../../src/scrapers/runner.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { fetchSourceMedia, sendSticker } from './sticker.js'

const execFileP = promisify(execFile)
const FONT_BOLD = process.env.FONT_BOLD_PATH || '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

export const config = {
  name: 'smeme',
  alias: ['memesticker'],
  category: 'maker',
  description: { id: 'Tambah teks atas bawah ke gambar yang dikutip, hasilnya stiker meme', en: 'Add top and bottom text to a quoted image, result is a meme sticker' },
  usage: '.smeme <atas> | <bawah> (kutip gambar)',
  example: '.smeme ketika coding | langsung jalan',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    smeme: {
      needImage: '╭─❏ 🖼️ 「 *BUTUH GAMBAR* 」\n┊ Kutip gambarnya dulu yaa, terus ketik *.smeme teks atas | teks bawah*~\n╰━━━━━━━',
      needText: '╭─❏ ✏️ 「 *BUTUH TEKS MEME* 」\n┊ Ketik teksnya dulu yaa, ꜰᴏʀᴍᴀᴛ: *.smeme teks atas | teks bawah*~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *KEGEDEAN* 」\n┊ Mouu, gambar sumbernya kegedean, di atas *16 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL BIKIN STIKER MEME* 」\n┊ Mouu, gagal bikin stiker meme: *{message}*~\n╰━━━━━━━',
      done: '╭─❏ 😂 「 *STIKER MEME JADI* 」\n┊ Stiker memenya jadii, siap bikin ngakak~\n╰━━━━━━━',
    },
  },
  en: {
    smeme: {
      needImage: '╭─❏ 🖼️ 「 *IMAGE NEEDED* 」\n┊ Quote an image first, then type *.smeme top text | bottom text*~\n╰━━━━━━━',
      needText: '╭─❏ ✏️ 「 *MEME TEXT NEEDED* 」\n┊ Type the text first, ꜰᴏʀᴍᴀᴛ: *.smeme top text | bottom text*~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *TOO BIG* 」\n┊ Mouu, the source image is too big, over *16 MB*~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *MEME STICKER FAILED* 」\n┊ Mouu, failed to make the meme sticker: *{message}*~\n╰━━━━━━━',
      done: '╭─❏ 😂 「 *MEME STICKER READY* 」\n┊ Your meme sticker is ready, ready to make people laugh~\n╰━━━━━━━',
    },
  },
}

async function drawMeme(source, top, bottom) {
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.png')
    await writeFile(input, source)
    const filters = []
    if (top) {
      const file = join(dir, 'top.txt')
      await writeFile(file, top.toUpperCase())
      filters.push(
        `drawtext=fontfile=${FONT_BOLD}:textfile=${file}:fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=18`
      )
    }
    if (bottom) {
      const file = join(dir, 'bottom.txt')
      await writeFile(file, bottom.toUpperCase())
      filters.push(
        `drawtext=fontfile=${FONT_BOLD}:textfile=${file}:fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-text_h-18`
      )
    }
    if (!filters.length) filters.push('null')
    try {
      await execFileP('ffmpeg', ['-y', '-i', input, '-vf', filters.join(','), '-frames:v', '1', out], { timeout: 30000 })
    } catch (err) {
      throw new Error(`ffmpeg smeme gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export const test = { input: '.smeme Halo semua | Apa kabar', expect: /BUTUH GAMBAR|NEED IMAGE/ }

export async function handler(ctx) {
  const [topRaw, bottomRaw] = ctx.text.split('|').map((s) => (s ?? '').trim())
  const top = topRaw || ''
  const bottom = bottomRaw || ''
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('smeme.failed', { message: err.message }))
  }
  if (!src || !['image', 'sticker', 'document'].includes(src.kind)) return ctx.reply(ctx.t('smeme.needImage'))
  if (src.buffer.length > MAX_IMAGE_BYTES) return ctx.reply(ctx.t('smeme.tooBig'))
  if (!top && !bottom) return ctx.reply(ctx.t('smeme.needText'))
  try {
    const png = await drawMeme(src.buffer, top, bottom)
    const webp = await toStickerWebp(png)
    await sendSticker(ctx, webp)
    return ctx.reply(ctx.t('smeme.done'))
  } catch (err) {
    return ctx.reply(ctx.t('smeme.failed', { message: err.message }))
  }
}
