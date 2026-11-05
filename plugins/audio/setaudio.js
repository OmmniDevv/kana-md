
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, rm, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const execFileP = promisify(execFile)
export const config = {
  name: "setaudio",
  alias: [],
  category: "audio",
  description: { id: "Fitur setaudio versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD setaudio feature, rewritten in KANA style" },
  usage: ".setaudio",
  example: ".setaudio",
  cooldown: 5,
}

export const i18n = {
  id: {
    "setaudio": {
      hint: "╭─❏ 🔄 「 *SETAUDIO* 」\n┊ Balas media (gambar/video/audio) yang mau diubah dulu yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *KONVERSI GAGAL* 」\n┊ Mouu, konversinya gagal: *{message}*\n╰━━━━━━━",
      done: "Hasil konversinya sudah KANA kirim di atas yaa~",
    },
  },
  en: {
    "setaudio": {
      hint: "╭─❏ 🔄 「 *SETAUDIO* 」\n┊ Reply to the media (image/video/audio) to convert first~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *CONVERSION FAILED* 」\n┊ Mouu, the conversion failed: *{message}*\n╰━━━━━━━",
      done: "KANA sent the converted result above~",
    },
  },
}

const MODE = "setaudio"
export const test = { input: '.setaudio', expect: /balas|reply/i }
export async function handler(ctx) {
  let buf = null
  try { buf = await ctx.downloadQuoted() } catch {}
  if (!buf) { try { buf = await ctx.downloadMedia() } catch {} }
  if (!buf) return ctx.reply(ctx.t('setaudio.hint'))
  const dir = await mkdtemp(join(tmpdir(), 'kana-convert-'))
  try {
    const input = join(dir, 'in.bin')
    await writeFile(input, buf)
    const plans = {
      tomp3: { out: 'out.mp3', args: ['-vn', '-codec:a', 'libmp3lame', '-q:a', '2'], send: (b) => ({ audio: b, mimetype: 'audio/mpeg' }) },
      toaudio: { out: 'out.mp3', args: ['-vn', '-codec:a', 'libmp3lame', '-q:a', '2'], send: (b) => ({ audio: b, mimetype: 'audio/mpeg' }) },
      tovn: { out: 'out.ogg', args: ['-vn', '-codec:a', 'libopus', '-b:a', '32k'], send: (b) => ({ audio: b, mimetype: 'audio/ogg; codecs=opus', ptt: true }) },
      toptt: { out: 'out.ogg', args: ['-vn', '-codec:a', 'libopus', '-b:a', '32k'], send: (b) => ({ audio: b, mimetype: 'audio/ogg; codecs=opus', ptt: true }) },
      setaudio: { out: 'out.ogg', args: ['-vn', '-codec:a', 'libopus', '-b:a', '32k'], send: (b) => ({ audio: b, mimetype: 'audio/ogg; codecs=opus', ptt: true }) },
      togif: { out: 'out.gif', args: ['-t', '6', '-vf', 'fps=10,scale=320:-1'], send: (b) => ({ image: b, gifPlayback: true }) },
      tomp4: { out: 'out.mp4', args: ['-codec:v', 'libx264', '-codec:a', 'aac', '-movflags', '+faststart'], send: (b) => ({ video: b, mimetype: 'video/mp4' }) },
      tovideo: { out: 'out.mp4', args: ['-codec:v', 'libx264', '-codec:a', 'aac', '-movflags', '+faststart'], send: (b) => ({ video: b, mimetype: 'video/mp4' }) },
    }
    const plan = plans[MODE] || plans.tomp3
    const outPath = join(dir, plan.out)
    await execFileP('ffmpeg', ['-y', '-i', input, ...plan.args, outPath], { timeout: 120000 })
    const out = await readFile(outPath)
    await ctx.sock.sendMessage(ctx.chat, plan.send(out), { quoted: ctx.raw })
    return ctx.reply(ctx.t('setaudio.done'))
  } catch (err) {
    return ctx.reply(ctx.t('setaudio.fail', { message: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
