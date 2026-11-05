
export const config = {
  name: "ramalanjodoh",
  alias: [],
  category: "primbon",
  description: { id: "Ramalan jodoh berdasarkan primbon Jawa", en: "KANA version of the Elaina-MD ramalanjodoh feature, rewritten in KANA style" },
  usage: ".ramalanjodoh",
  example: ".ramalanjodoh",
  cooldown: 5,
}

export const i18n = {
  id: {
    "ramalanjodoh": {
      body: "╭─❏ 🔮 「 *RAMALANJODOH* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔮 「 *RAMALANJODOH* 」\n┊ Tulis tanggal lahirnya yaa, contoh *.ramalanjodoh 2005-08-17*\n╰━━━━━━━",
      znote: "Primbon dan ramalan di sini cuma buat seru seruan yaa, jangan dianggap serius~",
    },
  },
  en: {
    "ramalanjodoh": {
      body: "╭─❏ 🔮 「 *RAMALANJODOH* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔮 「 *RAMALANJODOH* 」\n┊ Write the birth date, for example *.ramalanjodoh 2005-08-17*\n╰━━━━━━━",
      znote: "This primbon reading is just for fun, do not take it seriously~",
    },
  },
}

const MODE = "ramalanjodoh"
export const test = { input: '.ramalanjodoh', expect: /tanggal|primbon|birth/i }
function hashStr(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const ZODIAC = [
  ['Capricorn', 'Ambisius, sabar, dan pekerja keras.'],
  ['Aquarius', 'Unik, visioner, dan suka kebebasan.'],
  ['Pisces', 'Perasa, imajinatif, dan penuh empati.'],
  ['Aries', 'Berani, energik, dan suka memimpin.'],
  ['Taurus', 'Setia, tenang, dan suka kenyamanan.'],
  ['Gemini', 'Cerdas, komunikatif, dan serba bisa.'],
  ['Cancer', 'Penyayang, protektif, dan intuitif.'],
  ['Leo', 'Percaya diri, hangat, dan suka jadi pusat perhatian.'],
  ['Virgo', 'Teliti, rapi, dan perfeksionis.'],
  ['Libra', 'Adil, diplomatis, dan cinta keindahan.'],
  ['Scorpio', 'Intens, misterius, dan penuh tekad.'],
  ['Sagittarius', 'Optimis, petualang, dan jujur.'],
]
const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']
const PASARAN_TRAIT = { Legi: 'manis tutur katanya dan mudah bergaul', Pahing: 'ambisius dan kuat pendiriannya', Pon: 'suka menonjol dan pandai bicara', Wage: 'setia dan tekun bekerja', Kliwon: 'bijaksana dan beruntung dalam rezeki' }
const WETON_TRAIT = ['pekerja keras yang setia', 'pemikir yang tenang', 'periang dan mudah disukai', 'mandiri dan tegas', 'kreatif dan penuh ide', 'penyabar dan suka menolong', 'berani mengambil risiko']
export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  const m = raw.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/) || raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (MODE === 'zodiac' || MODE === 'weton') {
    if (!m) return ctx.reply(ctx.t('ramalanjodoh.hint'))
    const [y, mo, d] = m[3] && m[3].length === 4 ? [Number(m[3]), Number(m[2]), Number(m[1])] : [Number(m[1]), Number(m[2]), Number(m[3])]
    const date = new Date(Date.UTC(y, mo - 1, d))
    if (MODE === 'zodiac') {
      const cutoffs = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21]
      const idx = (mo - 1 + (d >= cutoffs[mo - 1] ? 1 : 0)) % 12
      const z = ZODIAC[idx]
      return ctx.reply(ctx.t('ramalanjodoh.body', { text: 'Tanggal *' + d + '/' + mo + '/' + y + '* itu zodiaknya *' + z[0] + '*.\n┊ ' + z[1] + '\n┊ ' + ctx.t('ramalanjodoh.znote') }))
    }
    const days = Math.floor(date.getTime() / 86400000)
    const pasaran = PASARAN[((days % 5) + 5) % 5]
    const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getUTCDay()]
    return ctx.reply(ctx.t('ramalanjodoh.body', { text: 'Weton *' + d + '/' + mo + '/' + y + '*: *' + dayName + ' ' + pasaran + '*.\n┊ Menurut primbon, orang ' + dayName + ' ' + pasaran + ' itu ' + PASARAN_TRAIT[pasaran] + ', dan dikenal sebagai ' + WETON_TRAIT[hashStr(dayName + pasaran) % WETON_TRAIT.length] + '.\n┊ ' + ctx.t('ramalanjodoh.znote') }))
  }
  if (!raw) return ctx.reply(ctx.t('ramalanjodoh.hint'))
  const h = hashStr(ctx.senderDigits + ':' + 'ramalanjodoh' + ':' + raw.toLowerCase())
  const picks = {
    artinama: ['nama yang membawa ketenangan dan rezeki yang stabil', 'nama yang kuat, cocok untuk pemimpin', 'nama yang lembut dan membawa keberuntungan dalam pertemanan', 'nama yang unik dan penuh semangat petualang'],
    kecocokan: null,
    nomerhoki: null,
    tafsirmimpi: ['mimpi itu pertanda ada kabar baik yang mendekat', 'mimpi itu cerminan pikiranmu yang lagi capek, istirahat yaa', 'mimpi itu tanda peluang baru, siap siap saja', 'mimpi itu pengingat buat lebih hati hati sama keputusan minggu ini'],
    sifatbisnis: ['cocok di bisnis kuliner dan jasa harian', 'cocok di bisnis kreatif dan konten', 'cocok di bisnis teknologi dan layanan online', 'cocok di bisnis perdagangan dan reseller'],
    ramalanjodoh: ['jodohmu dekat, cirinya suka ketawa di momen serius', 'jodohmu datang dari lingkaran pertemanan lama', 'jodohmu tipe pekerja keras yang pendiam', 'jodohmu suka traveling dan kulineran'],
    potensipenyakit: ['jaga pola tidur dan kurangi begadang yaa', 'perbanyak minum air dan gerak ringan', 'jaga pencernaan, jangan telat makan', 'istirahatkan mata dari layar sesekali'],
  }
  if (MODE === 'kecocokan') {
    const score = 40 + (h % 61)
    return ctx.reply(ctx.t('ramalanjodoh.body', { text: 'Kecocokan *' + raw + '* : *' + score + '%*\n┊ ' + (score >= 80 ? 'Serasi banget, pertahankan~' : score >= 60 ? 'Cukup serasi, komunikasinya dijaga yaa' : 'Perlu usaha ekstra, tapi bukan tidak mungkin~') + '\n┊ ' + ctx.t('ramalanjodoh.znote') }))
  }
  if (MODE === 'nomerhoki') {
    return ctx.reply(ctx.t('ramalanjodoh.body', { text: 'Nomor hoki buat *' + raw + '* hari ini: *' + (h % 90 + 10) + '-' + (h % 900 + 100) + '*\n┊ ' + ctx.t('ramalanjodoh.znote') }))
  }
  const arr = picks[MODE] || picks.artinama
  return ctx.reply(ctx.t('ramalanjodoh.body', { text: 'Buat *' + raw + '*: ' + arr[h % arr.length] + '.\n┊ ' + ctx.t('ramalanjodoh.znote') }))
}
