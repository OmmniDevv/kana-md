// Ubah video yang dikutip menjadi GIF animasi (ffmpeg lokal).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = promisify(execFile)

export const config = {
  name: 'togif',
  alias: ['videogif', 'jadigif'],
  category: 'maker',
  description: { id: 'Ubah video yang dikutip menjadi GIF animasi', en: 'Turn a quoted video into an animated GIF' },
  usage: '.togif (balas video)',
  example: '.togif',
  cooldown: 15,
}

export const i18n = {
  id: { togif: { need: '╭─❏ 🎞️ 「 *BUTUH VIDEO* 」\n┊ Balas video yang mau dijadikan GIF yaa~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN GIF* 」\n┊ Mouu, gagal bikin GIF-nya: *{error}*~\n╰━━━━━━━' } },
  en: { togif: { need: '╭─❏ 🎞️ 「 *VIDEO NEEDED* 」\n┊ Reply to the video you want as a GIF please~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GIF FAILED* 」\n┊ Mouu, failed to make the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.togif', expect: /balas|reply/i }

export async function handler(ctx) {
  const media = await ctx.downloadQuoted().catch(() => null)
  if (!media?.buffer || media.kind !== 'video') return ctx.reply(ctx.t('togif.need', { mood: ctx.say('mikir') }))
  const dir = await mkdtemp(join(tmpdir(), 'kana-togif-'))
  try {
    const input = join(dir, 'in.mp4')
    const output = join(dir, 'out.gif')
    await writeFile(input, media.buffer)
    await run('ffmpeg', ['-y', '-t', '6', '-i', input, '-vf', 'fps=12,scale=480:-1:flags=lanczos', '-loop', '0', output], { timeout: 60000 })
    const gif = await readFile(output)
    await ctx.sock.sendMessage(ctx.chat, { video: gif, gifPlayback: true }, { quoted: ctx.raw })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('togif.fail', { error: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
