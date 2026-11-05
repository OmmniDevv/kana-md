// Konversi GIF animasi menjadi MP4 untuk pesan video gifPlayback.
//
// Temuan tes live 2026-11-05 (laporan owner "GIF gabisa dibuka"): pesan
// video WhatsApp wajib berwadah MP4. Buffer GIF asli (magic GIF89a) yang
// dikirim sebagai { video, gifPlayback: true } tidak bisa diputar HP.
// Jadi semua keluaran GIF yang mau tampil sebagai GIF di chat harus
// diubah ke MP4 dulu (H.264, yuv420p, tanpa audio, faststart); klien
// WhatsApp yang memutarnya berulang seperti GIF.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../scrapers/runner.js'

const execFileP = promisify(execFile)

export function isGifBuffer(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length >= 6 && buffer.toString('ascii', 0, 6).startsWith('GIF8')
}

export function isMp4Buffer(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length >= 8 && buffer.toString('ascii', 4, 8) === 'ftyp'
}

// Ubah buffer GIF menjadi buffer MP4 siap gifPlayback.
// Buffer yang sudah MP4 dikembalikan apa adanya; format lain ditolak.
export async function toGifPlaybackMp4(buffer) {
  if (isMp4Buffer(buffer)) return buffer
  if (!isGifBuffer(buffer)) throw new Error('Buffer bukan GIF atau MP4, tidak bisa dijadikan gifPlayback')
  return withTempDir(async (dir) => {
    const input = join(dir, 'in.gif')
    const out = join(dir, 'out.mp4')
    await writeFile(input, buffer)
    const vf = "fps=30,scale='min(512,iw)':-2:flags=lanczos,format=yuv420p"
    try {
      await execFileP(
        'ffmpeg',
        ['-y', '-i', input, '-vf', vf, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-an', '-movflags', '+faststart', out],
        { timeout: 90000 }
      )
    } catch (err) {
      throw new Error(`ffmpeg konversi GIF ke MP4 gagal: ${(err.stderr || err.message).slice(-300)}`)
    }
    const mp4 = await readFile(out)
    if (!isMp4Buffer(mp4)) throw new Error('Hasil konversi GIF bukan MP4 yang valid')
    return mp4
  })
}
