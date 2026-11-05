
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, rm, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const execFileP = promisify(execFile)
export const config = {
  name: "blur",
  alias: [],
  category: "tools",
  description: { id: "Fitur blur versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD blur feature, rewritten in KANA style" },
  usage: ".blur",
  example: ".blur",
  cooldown: 5,
  limitGroup: "upscale",
}

export const i18n = {
  id: {
    "blur": {
      hint: "╭─❏ ✨ 「 *BLUR* 」\n┊ Balas gambar yang mau diproses dulu yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PROSES GAGAL* 」\n┊ Mouu, prosesnya gagal: *{message}*\n╰━━━━━━━",
      done: "Hasilnya sudah KANA kirim di atas yaa~",
    },
  },
  en: {
    "blur": {
      hint: "╭─❏ ✨ 「 *BLUR* 」\n┊ Reply to the image to process first~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PROCESS FAILED* 」\n┊ Mouu, the process failed: *{message}*\n╰━━━━━━━",
      done: "KANA sent the result above~",
    },
  },
}

const MODE = "blur"
export const test = { input: '.blur', expect: /balas|reply/i }
export async function handler(ctx) {
  let buf = null
  try { buf = await ctx.downloadQuoted() } catch {}
  if (!buf) { try { buf = await ctx.downloadMedia() } catch {} }
  if (!buf) return ctx.reply(ctx.t('blur.hint'))
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
    await ctx.sock.sendMessage(ctx.chat, { image: out, caption: 'blur' }, { quoted: ctx.raw })
    return ctx.reply(ctx.t('blur.done'))
  } catch (err) {
    return ctx.reply(ctx.t('blur.fail', { message: err.message }))
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
