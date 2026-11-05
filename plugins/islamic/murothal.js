// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama hanya
// teks statis tanpa audio sama sekali. Sekarang murottal NYATA: audio
// surah penuh Mishary Alafasy 128kbps dari CDN Islamic Network
// (cdn.islamic.network/quran/audio-surah) yang terverifikasi dari VM
// dengan byte magic MP3 valid, metadata nama surah dari API equran.id.
// Surah yang berkasnya melebihi batas kirim WhatsApp (16 MB) tidak
// dipaksakan: KANA membalas jujur dengan tautan dengar langsungnya.
// .murrotal (ejaan lama) menjadi alias kanonis file ini.
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { MAX_AUDIO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'murothal',
  alias: ['murrotal', 'murottal'],
  category: 'islamic',
  description: { id: 'Dengarkan murottal Al Quran satu surah penuh (audio Alafasy) dengan menulis nomor surahnya', en: 'Listen to a full surah murottal (Alafasy audio) by giving the surah number' },
  usage: '.murothal <nomor surah>',
  example: '.murothal 1',
  cooldown: 10,
}

export const i18n = {
  id: {
    murothal: {
      usage: '╭─❏ 🕌 「 *MUROTTAL* 」\n┊ Tulis nomor surahnya yaa, contoh: *.murothal 1* (Al-Fatihah)\n┊ Nomor surah dari 1 sampai 114\n╰━━━━━━━',
      info: '╭─❏ 🕌 「 *MUROTTAL* 」\n┊ ꜱᴜʀᴀʜ ᴋᴇ: *{n}*\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴊᴜᴍʟᴀʜ ᴀʏᴀᴛ: *{ayat}*\n┊ Qari: Mishary Rashid Alafasy. Audionya KANA kirim di bawah ini yaa~\n╰━━━━━━━',
      tooBig: '╭─❏ 🕌 「 *MUROTTAL {name}* 」\n┊ Audio surah ke-{n} ini ukurannya *{mb} MB*, melebihi batas kirim audio WhatsApp (16 MB), jadi KANA tidak bisa melampirkannya langsung.\n┊ Dengarkan lewat tautan resminya di sini:\n┊ {url}\n╰━━━━━━━',
      failed: '╭─❏ 🕌 「 *MUROTTAL GAGAL* 」\n┊ Audio surah ke-{n} gagal diambil: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    murothal: {
      usage: '╭─❏ 🕌 「 *MUROTTAL* 」\n┊ Write the surah number please, example: *.murothal 1* (Al-Fatihah)\n┊ Surah numbers run from 1 to 114\n╰━━━━━━━',
      info: '╭─❏ 🕌 「 *MUROTTAL* 」\n┊ ꜱᴜʀᴀʜ: *{n}*\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴠᴇʀꜱᴇꜱ: *{ayat}*\n┊ Reciter: Mishary Rashid Alafasy. The audio is sent below~\n╰━━━━━━━',
      tooBig: '╭─❏ 🕌 「 *MUROTTAL {name}* 」\n┊ The audio for surah {n} is *{mb} MB*, over the WhatsApp audio send limit (16 MB), so KANA cannot attach it directly.\n┊ Listen through the official link here:\n┊ {url}\n╰━━━━━━━',
      failed: '╭─❏ 🕌 「 *MUROTTAL FAILED* 」\n┊ The audio for surah {n} could not be fetched: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.murothal 1', expect: /MUROTTAL|AL-FATIHAH/i }

export function surahAudioUrl(n) {
  return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`
}

// MP3 valid diawali header ID3 atau sinkronisasi frame 0xFFEx/0xFFFx.
export function isMp3Buffer(buffer) {
  if (!buffer || buffer.length < 3) return false
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true
  return buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0
}

export async function fetchSurahMeta(n, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(`https://equran.id/api/v2/surat/${n}`)
    if (!res?.ok) return null
    const json = await res.json()
    const data = json?.data
    if (!data) return null
    return { name: data.namaLatin ?? data.nama ?? '', ayat: data.jumlahAyat ?? 0 }
  } catch {
    return null
  }
}

export async function handler(ctx, { fetchImpl = fetch, download = downloadBuffer } = {}) {
  const n = Number.parseInt(ctx.args?.[0] ?? '', 10)
  if (!Number.isInteger(n) || n < 1 || n > 114) return ctx.reply(ctx.t('murothal.usage'))
  const url = surahAudioUrl(n)
  const meta = await fetchSurahMeta(n, fetchImpl)
  const name = meta?.name || `Surah ${n}`
  try {
    const head = await fetchImpl(url, { method: 'HEAD' }).catch(() => null)
    const length = Number(head?.headers?.get?.('content-length') ?? 0)
    if (length > MAX_AUDIO_BYTES) {
      return ctx.reply(ctx.t('murothal.tooBig', { n, name, mb: (length / 1048576).toFixed(1), url }))
    }
    const { buffer } = await download(url, { maxBytes: MAX_AUDIO_BYTES, timeout: 120000 })
    if (!isMp3Buffer(buffer)) throw new Error('berkas bukan MP3 valid')
    await ctx.reply(ctx.t('murothal.info', { n, name, ayat: meta?.ayat || '-' }))
    await ctx.sock.sendMessage(ctx.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `murothal-${n}.mp3`,
    }, { quoted: ctx.raw })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('murothal.failed', { n, message: err.message }))
  }
}
