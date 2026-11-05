
import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
export const config = {
  name: "nisfusyaban",
  alias: [],
  category: "islamic",
  description: { id: "Informasi lengkap tentang Malam Nisfu Syaban (doa, amalan, keutamaan)", en: "KANA version of the Elaina-MD nisfusyaban feature, rewritten in KANA style" },
  usage: ".nisfusyaban",
  example: ".nisfusyaban",
  cooldown: 5,
}

export const i18n = {
  id: {
    "nisfusyaban": {
      body: "╭─❏ 🕌 「 *NISFUSYABAN* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *NISFUSYABAN* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "nisfusyaban": {
      body: "╭─❏ 🕌 「 *NISFUSYABAN* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *NISFUSYABAN* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

const MODE = "curated"
export const test = { input: '.nisfusyaban', expect: /nisfusyaban/i }
const CURATED = "{'id': 'Malam Nisfu Sya ban: malam pertengahan bulan Sya ban.\\n┊ Isi dengan sholat malam, baca Al-Quran, istighfar, dan doa. Perbaiki hubungan dengan sesama sebelum Ramadhan tiba.\\n┊ Semoga kita disampaikan ke Ramadhan dalam keadaan sehat~', 'en': 'The night of Nisfu Sha ban: the middle night of Sha ban.\\n┊ Fill it with night prayer, Quran reading, istighfar, and dua. Mend relationships before Ramadan arrives.\\n┊ May we reach Ramadan in good health~'}"
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('nisfusyaban.body', { text }))
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
    return ctx.reply(ctx.t('nisfusyaban.fail', { error: err.message }))
  }
}
