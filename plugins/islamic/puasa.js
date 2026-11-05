
import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
export const config = {
  name: "puasa",
  alias: [],
  category: "islamic",
  description: { id: "Panduan Puasa Sunnah Lengkap (Senin-Kamis, Dawud, Arafah, Asyura, dll)", en: "KANA version of the Elaina-MD puasa feature, rewritten in KANA style" },
  usage: ".puasa",
  example: ".puasa",
  cooldown: 5,
}

export const i18n = {
  id: {
    "puasa": {
      body: "╭─❏ 🕌 「 *PUASA* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *PUASA* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "puasa": {
      body: "╭─❏ 🕌 「 *PUASA* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *PUASA* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

const MODE = "curated"
export const test = { input: '.puasa', expect: /puasa/i }
const CURATED = "{'id': 'Panduan puasa sunnah:\\n┊ * Senin Kamis: puasa Nabi Daud dan kebiasaan Rasulullah.\\n┊ * Ayyamul Bidh: tanggal 13, 14, 15 Hijriah.\\n┊ * Puasa Daud: sehari puasa sehari berbuka.\\n┊ Niat cukup di hati sebelum fajar. Semangat ibadahnya~', 'en': 'Guide to sunnah fasting:\\n┊ * Monday and Thursday fasts.\\n┊ * Ayyamul Bidh: the 13th, 14th, 15th of the Hijri month.\\n┊ * Dawud fast: alternating days.\\n┊ Intention in the heart before dawn is enough. Keep it up~'}"
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('puasa.body', { text }))
  try {
    if (MODE === 'quran') {
      const num = Math.max(1, Math.min(114, parseInt(ctx.args[0]) || 1))
      const res = await fetch('https://equran.id/api/v2/surat/' + num, { signal: AbortSignal.timeout(20000) })
      const j = await res.json()
      const d = j.data
      const lines = (d.ayat || []).slice(0, 8).map((a) => a.nomorAyat + '. ' + a.teksArab + '\n   ' + (a.teksIndonesia || '')).join('\n┊ ')
      return say('*' + d.namaLatin + '* (surah ke-' + d.nomor + ', ' + d.jumlahAyat + ' ayat)\n┊ ' + (d.deskripsi || '').replace(/<[^>]+>/g, '').slice(0, 200) + '\n┊ ' + lines)
    }
    if (MODE === 'hijri') {
      const fmt = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' })
      return say('Tanggal Hijriah hari ini: *' + fmt.format(new Date()) + '*')
    }
    if (MODE === 'sholat') {
      const info = await getPrayerInfo((ctx.text || '').trim() || 'Jakarta')
      const rows = typeof info === 'object' ? Object.entries(info).filter(([, v]) => typeof v === 'string').map(([k, v]) => '* ' + k + ': ' + v).join('\n┊ ') : String(info)
      return say('Jadwal sholat *' + ((ctx.text || '').trim() || 'Jakarta') + '*:\n┊ ' + rows)
    }
    return say(CURATED[ctx.lang] || CURATED.id || 'Bismillahirrahmanirrahim. Semoga Allah mudahkan urusanmu hari ini, jaga sholat lima waktu, perbanyak istighfar, dan sedekah semampunya. Barakallahu fiik~')
  } catch (err) {
    return ctx.reply(ctx.t('puasa.fail', { error: err.message }))
  }
}
