
import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
export const config = {
  name: "jadwalsholat",
  alias: [],
  category: "islamic",
  description: { id: "Fitur jadwalsholat versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD jadwalsholat feature, rewritten in KANA style" },
  usage: ".jadwalsholat",
  example: ".jadwalsholat",
  cooldown: 5,
}

export const i18n = {
  id: {
    "jadwalsholat": {
      body: "╭─❏ 🕌 「 *JADWALSHOLAT* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *JADWALSHOLAT* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "jadwalsholat": {
      body: "╭─❏ 🕌 「 *JADWALSHOLAT* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🕌 「 *JADWALSHOLAT* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

const MODE = "sholat"
export const test = { input: '.jadwalsholat', expect: /jadwalsholat/i }
function todayJakarta() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
const CURATED = "{}"
export async function handler(ctx, { fetchInfo = getPrayerInfo } = {}) {
  const say = (text) => ctx.reply(ctx.t('jadwalsholat.body', { text }))
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
      // getPrayerInfo wajib menerima tanggal 'YYYY-MM-DD'; versi lama
      // memanggilnya tanpa tanggal sehingga selalu null dan
      // Object.entries(null) meledak ("Cannot convert undefined or
      // null to object"). Bentuk info: { city, times, extra }.
      const city = (ctx.text || '').trim() || 'Jakarta'
      const info = await fetchInfo(city, todayJakarta())
      if (!info) throw new Error('jadwal tidak ditemukan untuk kota ' + city)
      const rows = [
        ['Imsak', info.times.imsak],
        ['Subuh', info.times.subuh],
        ['Terbit', info.extra.terbit],
        ['Dzuhur', info.times.dzuhur],
        ['Ashar', info.times.ashar],
        ['Maghrib', info.times.maghrib],
        ['Isya', info.times.isya],
      ].filter(([, v]) => v).map(([k, v]) => '* ' + k + ': ' + v).join('\n┊ ')
      const label = info.extra.dateLabel ? '\n┊ 📅 ' + info.extra.dateLabel : ''
      return say('Jadwal sholat *' + (info.city.name || city) + '*:' + label + '\n┊ ' + rows)
    }
    return say(CURATED[ctx.lang] || CURATED.id || 'Bismillahirrahmanirrahim. Semoga Allah mudahkan urusanmu hari ini, jaga sholat lima waktu, perbanyak istighfar, dan sedekah semampunya. Barakallahu fiik~')
  } catch (err) {
    return ctx.reply(ctx.t('jadwalsholat.fail', { error: err.message }))
  }
}
