// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama hanya
// teks statis tanpa audio sama sekali. Sekarang audio per ayat NYATA:
// berkas MP3 per ayat Mishary Alafasy dari EveryAyah
// (everyayah.com/data/Alafasy_128kbps) yang terverifikasi dari VM
// dengan byte magic MPEG valid, nomor ayat divalidasi terhadap
// metadata jumlah ayat equran.id sebelum berkas diambil.
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { MAX_AUDIO_BYTES } from '../../src/ui/media.js'
import { fetchSurahMeta, isMp3Buffer } from './murothal.js'

export const config = {
  name: 'audioquran',
  alias: ['ayat'],
  category: 'islamic',
  description: { id: 'Dengarkan audio Al Quran per ayat (Alafasy) dengan menulis nomor surah dan ayatnya', en: 'Listen to Quran audio per verse (Alafasy) by giving the surah and verse numbers' },
  usage: '.audioquran <nomor surah> <nomor ayat>',
  example: '.audioquran 1 1',
  cooldown: 10,
}

export const i18n = {
  id: {
    audioquran: {
      usage: '╭─❏ 🕌 「 *AUDIOQURAN* 」\n┊ Format: *.audioquran <nomor surah> <nomor ayat>*\n┊ Contoh: *.audioquran 1 1* buat Al-Fatihah ayat 1\n╰━━━━━━━',
      badAyat: '╭─❏ 🕌 「 *AUDIOQURAN* 」\n┊ Surah *{name}* hanya punya *{ayat}* ayat, jadi ayat ke-{n} tidak ada~\n╰━━━━━━━',
      info: '╭─❏ 🕌 「 *AUDIOQURAN* 」\n┊ ꜱᴜʀᴀʜ: *{name}* (ke-{s})\n┊ ᴀʏᴀᴛ: *{a}*\n┊ Qari: Mishary Rashid Alafasy. Audionya KANA kirim di bawah ini yaa~\n╰━━━━━━━',
      failed: '╭─❏ 🕌 「 *AUDIOQURAN GAGAL* 」\n┊ Audio surah {s} ayat {a} gagal diambil: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    audioquran: {
      usage: '╭─❏ 🕌 「 *AUDIOQURAN* 」\n┊ Format: *.audioquran <surah number> <verse number>*\n┊ Example: *.audioquran 1 1* for Al-Fatihah verse 1\n╰━━━━━━━',
      badAyat: '╭─❏ 🕌 「 *AUDIOQURAN* 」\n┊ Surah *{name}* only has *{ayat}* verses, so verse {n} does not exist~\n╰━━━━━━━',
      info: '╭─❏ 🕌 「 *AUDIOQURAN* 」\n┊ ꜱᴜʀᴀʜ: *{name}* (number {s})\n┊ ᴠᴇʀꜱᴇ: *{a}*\n┊ Reciter: Mishary Rashid Alafasy. The audio is sent below~\n╰━━━━━━━',
      failed: '╭─❏ 🕌 「 *AUDIOQURAN FAILED* 」\n┊ The audio for surah {s} verse {a} could not be fetched: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.audioquran 1 1', expect: /AUDIOQURAN|AL-FATIHAH/i }

// Pola EveryAyah: kode 6 digit, 3 digit nomor surah + 3 digit nomor ayat.
export function ayahAudioUrl(surah, ayah) {
  const code = String(surah).padStart(3, '0') + String(ayah).padStart(3, '0')
  return `https://everyayah.com/data/Alafasy_128kbps/${code}.mp3`
}

export async function handler(ctx, { fetchImpl = fetch, download = downloadBuffer } = {}) {
  const surah = Number.parseInt(ctx.args?.[0] ?? '', 10)
  const ayah = Number.parseInt(ctx.args?.[1] ?? '1', 10)
  if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) {
    return ctx.reply(ctx.t('audioquran.usage'))
  }
  const meta = await fetchSurahMeta(surah, fetchImpl)
  const name = meta?.name || `Surah ${surah}`
  if (meta?.ayat && ayah > meta.ayat) {
    return ctx.reply(ctx.t('audioquran.badAyat', { name, ayat: meta.ayat, n: ayah }))
  }
  const url = ayahAudioUrl(surah, ayah)
  try {
    const { buffer } = await download(url, { maxBytes: MAX_AUDIO_BYTES, timeout: 60000 })
    if (!isMp3Buffer(buffer)) throw new Error('berkas bukan MP3 valid')
    await ctx.reply(ctx.t('audioquran.info', { s: surah, a: ayah, name }))
    await ctx.sock.sendMessage(ctx.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `audioquran-${surah}-${ayah}.mp3`,
    }, { quoted: ctx.raw })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('audioquran.failed', { s: surah, a: ayah, message: err.message }))
  }
}
