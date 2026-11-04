// Beri gaya visual ke gambar yang dikutip (ffmpeg lokal): anime, manga,
// watercolor, vintage, abu, cermin. Fallback lokal untuk keluarga
// toanime/tofigure Elaina yang generatif (tidak ditiru).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sendImage } from '../../src/ui/media.js'

const run = promisify(execFile)

export const STYLES = {
  anime: 'eq=saturation=1.45:contrast=1.12:brightness=0.03,unsharp=5:5:1.0',
  manga: 'format=gray,edgedetect=low=0.08:high=0.35,negate',
  watercolor: 'gblur=sigma=2,eq=saturation=1.5:contrast=1.05',
  vintage: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0,eq=contrast=0.92:brightness=0.04',
  abu: 'format=gray',
  cermin: 'hflip',
}

export const config = {
  name: 'imgstyle',
  alias: ['gayaimg', 'toanime', 'tomanga', 'fotogaya', 'tocermin', 'towatercolor'],
  category: 'maker',
  description: { id: 'Beri gaya ke gambar yang dikutip: anime, manga, watercolor, vintage, abu, cermin', en: 'Style a quoted image: anime, manga, watercolor, vintage, gray, mirror' },
  usage: '.imgstyle <gaya> (balas gambar)',
  example: '.imgstyle anime',
  cooldown: 10,
}

export const i18n = {
  id: {
    imgstyle: {
      need: 'Balas gambarnya dan pilih gayanya yaa: anime, manga, watercolor, vintage, abu, cermin. Contoh: .imgstyle anime. {mood}',
      caption: 'Nih gambar gaya {style}-nya~ 🎨',
      fail: 'Gagal kasih gayanya: {error}',
    },
  },
  en: {
    imgstyle: {
      need: 'Reply to the image and pick a style please: anime, manga, watercolor, vintage, gray, mirror. Example: .imgstyle anime. {mood}',
      caption: 'Here is your {style} styled image~ 🎨',
      fail: 'Failed to style the image: {error}',
    },
  },
}

export const test = { input: '.imgstyle', expect: /anime/ }

const STYLE_ALIASES = { gray: 'abu', grey: 'abu', mirror: 'cermin', flip: 'cermin' }

export async function handler(ctx) {
  const wanted = (ctx.text || '').trim().toLowerCase().split(/\s+/)[0]
  const style = STYLES[wanted] ? wanted : STYLE_ALIASES[wanted]
  const media = await ctx.downloadQuoted().catch(() => null)
  if (!style || !media?.buffer || media.kind !== 'image') {
    return ctx.reply(ctx.t('imgstyle.need', { mood: ctx.say('mikir') }))
  }
  const dir = await mkdtemp(join(tmpdir(), 'kana-style-'))
  try {
    const input = join(dir, 'in.bin')
    const output = join(dir, 'out.png')
    await writeFile(input, media.buffer)
    await run('ffmpeg', ['-y', '-i', input, '-vf', STYLES[style], output], { timeout: 60000 })
    const out = await readFile(output)
    return sendImage(ctx, out, { caption: ctx.t('imgstyle.caption', { style }) })
  } catch (err) {
    return ctx.reply(ctx.t('imgstyle.fail', { error: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
