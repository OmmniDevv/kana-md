// Engine efek audio KANA: ffmpeg lokal, input audio/video dari pesan yang
// dikutip atau pesan sendiri, keluaran MP3. Satu helper bersama untuk
// semua plugin di folder plugins/audio.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../scrapers/runner.js'
import { sendAudio, MAX_VIDEO_BYTES } from '../ui/media.js'

const execFileP = promisify(execFile)

export const FX_FILTERS = {
  bass: 'bass=g=15',
  nightcore: 'aresample=44100,asetrate=44100*1.25',
  slowrev: 'atempo=0.8,aecho=0.8:0.88:60:0.4',
  reverse: 'areverse',
  echo: 'aecho=0.8:0.9:1000:0.3',
  chipmunk: 'asetrate=44100*1.4,aresample=44100,atempo=1.15',
  deep: 'asetrate=44100*0.75,aresample=44100,atempo=1.1',
  audio8d: 'apulsator=hz=0.125',
}

function messageHasAv(message) {
  if (!message) return false
  return Boolean(message.audioMessage || message.videoMessage)
}

export async function fetchAudioInput(ctx) {
  if (ctx.quoted?.message && messageHasAv(ctx.quoted.message)) {
    return ctx.downloadQuoted()
  }
  if (messageHasAv(ctx.raw?.message)) {
    return ctx.downloadMedia()
  }
  return null
}

export async function applyFx(buffer, fxName) {
  const filter = FX_FILTERS[fxName]
  if (!filter) throw new Error(`fx tidak dikenal: ${fxName}`)
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.bin')
    const out = join(dir, 'out.mp3')
    await writeFile(input, buffer)
    try {
      await execFileP(
        'ffmpeg',
        ['-y', '-i', input, '-vn', '-af', filter, '-c:a', 'libmp3lame', '-q:a', '4', out],
        { timeout: 90000 },
      )
    } catch (err) {
      throw new Error(`ffmpeg fx gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
}

export function fxHandler(fxName, texts) {
  return async function handler(ctx) {
    let buffer = null
    try {
      buffer = await fetchAudioInput(ctx)
    } catch {
      buffer = null
    }
    if (!buffer?.length) return ctx.reply(ctx.t(`${fxName}.needAudio`))
    if (buffer.length > MAX_VIDEO_BYTES) return ctx.reply(ctx.t(`${fxName}.tooBig`))
    try {
      const out = await applyFx(buffer, fxName)
      return sendAudio(ctx, out, { title: texts?.title ?? fxName })
    } catch (err) {
      return ctx.reply(ctx.t(`${fxName}.failed`, { message: err.message }))
    }
  }
}
