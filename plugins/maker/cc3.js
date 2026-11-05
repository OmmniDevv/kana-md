
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, rm, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const execFileP = promisify(execFile)
export const config = {
  name: "cc3",
  alias: [],
  category: "maker",
  description: { id: "Color Grading CC3 - Cyberpunk Neon Blue Pink", en: "KANA version of the Elaina-MD cc3 feature, rewritten in KANA style" },
  usage: ".cc3",
  example: ".cc3",
  cooldown: 5,
}

export const i18n = {
  id: {
    "cc3": {
      hint: "╭─❏ ✨ 「 *CC3* 」\n┊ Balas gambar yang mau diproses dulu yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PROSES GAGAL* 」\n┊ Mouu, prosesnya gagal: *{message}*\n╰━━━━━━━",
      done: "Hasilnya sudah KANA kirim di atas yaa~",
    },
  },
  en: {
    "cc3": {
      hint: "╭─❏ ✨ 「 *CC3* 」\n┊ Reply to the image to process first~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PROCESS FAILED* 」\n┊ Mouu, the process failed: *{message}*\n╰━━━━━━━",
      done: "KANA sent the result above~",
    },
  },
}

const MODE = "colorgrade"
export const test = { input: '.cc3', expect: /balas|reply/i }
export async function handler(ctx) {
  let buf = null
  try { buf = await ctx.downloadQuoted() } catch {}
  if (!buf) { try { buf = await ctx.downloadMedia() } catch {} }
  if (!buf) return ctx.reply(ctx.t('cc3.hint'))
  const dir = await mkdtemp(join(tmpdir(), 'kana-fx-'))
  try {
    const input = join(dir, 'in.img')
    const outPath = join(dir, 'out.png')
    await writeFile(input, buf)
    const filters = {
      upscale: 'scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:1.0',
      hd: 'scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:1.0,eq=contrast=1.05:saturation=1.08',
      enhance: 'eq=contrast=1.08:brightness=0.03:saturation=1.12,unsharp=5:5:0.8',
      blur: 'boxblur=8:2',
      colorgrade: 'eq=contrast=1.15:saturation=0.75:brightness=-0.04,colorbalance=bs=0.15:rs=-0.05',
      resize: 'scale=512:512:force_original_aspect_ratio=decrease',
      ascii: 'scale=80:40,format=gray',
    }
    await execFileP('ffmpeg', ['-y', '-i', input, '-vf', filters[MODE] || filters.upscale, outPath], { timeout: 120000 })
    const out = await readFile(outPath)
    await ctx.sock.sendMessage(ctx.chat, { image: out, caption: 'cc3' }, { quoted: ctx.raw })
    return ctx.reply(ctx.t('cc3.done'))
  } catch (err) {
    return ctx.reply(ctx.t('cc3.fail', { message: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
