
import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
export const config = {
  name: "istikharah",
  alias: [],
  category: "islamic",
  description: { id: "Panduan Sholat Istikharah lengkap (tata cara, doa, waktu, dan keutamaan)", en: "KANA version of the Elaina-MD istikharah feature, rewritten in KANA style" },
  usage: ".istikharah",
  example: ".istikharah",
  cooldown: 5,
}

export const i18n = {
  id: {
    "istikharah": {
      body: "╭─❏ 🕌 「 *ISTIKHARAH* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *ISTIKHARAH* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "istikharah": {
      body: "╭─❏ 🕌 「 *ISTIKHARAH* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *ISTIKHARAH* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

const MODE = "curated"
export const test = { input: '.istikharah', expect: /istikharah/i }
const CURATED = "{'id': 'Sholat Istikharah:\\n┊ 1. Sholat sunnah 2 rakaat dengan niat istikharah.\\n┊ 2. Rakaat pertama Al-Fatihah + Al-Kafirun, kedua Al-Fatihah + Al-Ikhlas.\\n┊ 3. Baca doa istikharah: Allahumma inni astakhiruka bi ilmika wa astaqdiruka bi qudratika...\\n┊ Jawabannya datang lewat kemantapan hati dan kemudahan jalan, bukan selalu mimpi yaa~', 'en': 'Istikharah prayer:\\n┊ 1. Pray 2 rakah with the intention of istikharah.\\n┊ 2. First rakah Al-Fatihah + Al-Kafirun, second Al-Fatihah + Al-Ikhlas.\\n┊ 3. Recite the istikharah dua: Allahumma inni astakhiruka bi ilmika wa astaqdiruka bi qudratika...\\n┊ The answer comes through a settled heart and eased paths, not always dreams~'}"
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('istikharah.body', { text }))
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
    return ctx.reply(ctx.t('istikharah.fail', { error: err.message }))
  }
}
