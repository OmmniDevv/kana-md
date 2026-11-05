
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, rm, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const execFileP = promisify(execFile)
export const config = {
  name: "audio",
  alias: [],
  category: "audio",
  description: { id: "Fitur audio versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD audio feature, rewritten in KANA style" },
  usage: ".audio",
  example: ".audio",
  cooldown: 5,
}

export const i18n = {
  id: {
    "audio": {
      hint: "╭─❏ 🎚️ 「 *AUDIO* 」\n┊ Balas audio atau voice note yang mau dikasih efek dulu yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *EFEK GAGAL* 」\n┊ Mouu, efeknya gagal: *{message}*\n╰━━━━━━━",
      done: "Efeknya sudah KANA kirim di atas yaa~",
    },
  },
  en: {
    "audio": {
      hint: "╭─❏ 🎚️ 「 *AUDIO* 」\n┊ Reply to the audio or voice note to add the effect first~\n╰━━━━━━━",
      fail: "╭─❏ 🎚️ 「 *EFFECT FAILED* 」\n┊ Mouu, the effect failed: *{message}*\n╰━━━━━━━",
      done: "KANA sent the effected audio above~",
    },
  },
}

const MODE = "bass"
export const test = { input: '.audio', expect: /balas|reply/i }
export async function handler(ctx) {
  let buf = null
  try { buf = await ctx.downloadQuoted() } catch {}
  if (!buf) { try { buf = await ctx.downloadMedia() } catch {} }
  if (!buf) return ctx.reply(ctx.t('audio.hint'))
  const dir = await mkdtemp(join(tmpdir(), 'kana-afx-'))
  try {
    const input = join(dir, 'in.bin')
    const outPath = join(dir, 'out.mp3')
    await writeFile(input, buf)
    const filters = {
      bass: 'bass=g=15:f=110:w=0.3',
      earrape: 'volume=3.0,alimiter=limit=0.9',
      nightcore: 'asetrate=44100*1.25,aresample=44100,atempo=1.0',
      slowed: 'asetrate=44100*0.8,aresample=44100',
      reverb: 'aecho=0.8:0.9:60:0.4',
      reverse: 'areverse',
      chipmunk: 'asetrate=44100*1.4,aresample=44100',
      deep: 'asetrate=44100*0.75,aresample=44100',
    }
    await execFileP('ffmpeg', ['-y', '-i', input, '-af', filters[MODE] || filters.bass, '-codec:a', 'libmp3lame', outPath], { timeout: 120000 })
    const out = await readFile(outPath)
    await ctx.sock.sendMessage(ctx.chat, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.raw })
    return ctx.reply(ctx.t('audio.done'))
  } catch (err) {
    return ctx.reply(ctx.t('audio.fail', { message: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
