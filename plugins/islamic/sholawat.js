
import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
export const config = {
  name: "sholawat",
  alias: [],
  category: "islamic",
  description: { id: "Kumpulan Sholawat Nabi lengkap dengan Arab, Latin, Arti, dan Keutamaan", en: "KANA version of the Elaina-MD sholawat feature, rewritten in KANA style" },
  usage: ".sholawat",
  example: ".sholawat",
  cooldown: 5,
}

export const i18n = {
  id: {
    "sholawat": {
      body: "╭─❏ 🕌 「 *SHOLAWAT* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *SHOLAWAT* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "sholawat": {
      body: "╭─❏ 🕌 「 *SHOLAWAT* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *SHOLAWAT* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

const MODE = "curated"
export const test = { input: '.sholawat', expect: /sholawat/i }
const CURATED = "{'id': 'Allahumma shalli ala sayyidina Muhammad wa ala ali sayyidina Muhammad.\\n┊ Artinya: Ya Allah, limpahkanlah shalawat kepada junjungan kami Nabi Muhammad dan kepada keluarga junjungan kami Nabi Muhammad.\\n┊ Perbanyak sholawat terutama hari Jumat yaa~', 'en': 'Allahumma shalli ala sayyidina Muhammad wa ala ali sayyidina Muhammad.\\n┊ Meaning: O Allah, send blessings upon our master Muhammad and upon the family of our master Muhammad.\\n┊ Recite lots of sholawat, especially on Fridays~'}"
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('sholawat.body', { text }))
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
    return ctx.reply(ctx.t('sholawat.fail', { error: err.message }))
  }
}
