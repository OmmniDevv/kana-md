
import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
export const config = {
  name: "mandiwajib",
  alias: [],
  category: "islamic",
  description: { id: "Panduan cara mandi wajib beserta doa", en: "KANA version of the Elaina-MD mandiwajib feature, rewritten in KANA style" },
  usage: ".mandiwajib",
  example: ".mandiwajib",
  cooldown: 5,
}

export const i18n = {
  id: {
    "mandiwajib": {
      body: "╭─❏ 🕌 「 *MANDIWAJIB* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *MANDIWAJIB* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "mandiwajib": {
      body: "╭─❏ 🕌 「 *MANDIWAJIB* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *MANDIWAJIB* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

const MODE = "curated"
export const test = { input: '.mandiwajib', expect: /mandiwajib/i }
const CURATED = "{'id': 'Tata cara mandi wajib:\\n┊ 1. Niat menghilangkan hadas besar.\\n┊ 2. Cuci tangan 3x, bersihkan kemaluan.\\n┊ 3. Wudhu seperti wudhu sholat.\\n┊ 4. Siram kepala 3x sampai pangkal rambut.\\n┊ 5. Siram seluruh badan, kanan dulu lalu kiri, pastikan semua kulit dan rambut basah.\\n┊ Selesai, kamu sudah suci lagi~', 'en': 'How to perform ghusl (obligatory bath):\\n┊ 1. Intend to remove major impurity.\\n┊ 2. Wash hands 3 times, clean the private parts.\\n┊ 3. Perform wudhu like for prayer.\\n┊ 4. Pour water over the head 3 times.\\n┊ 5. Wash the whole body, right side first, making sure all skin and hair are wet.\\n┊ Done, you are purified~'}"
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('mandiwajib.body', { text }))
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
    return ctx.reply(ctx.t('mandiwajib.fail', { error: err.message }))
  }
}
