import { sendButtons } from '../../src/ui/buttons.js'
import { getZodiak } from '../../src/scrapers/search/primbon.js'

// Zodiak primbon: atribut keberuntungan satu tanda dari API primbon
// Siputzx, sama seperti padanan Elaina-MD. String gabungan dari API
// diuraikan jadi atribut terpisah oleh parseZodiak di scraper; bila
// uraiannya tidak lengkap, string aslinya ditampilkan apa adanya.
export const config = {
  name: 'zodiak',
  alias: ['horoscope', 'ramalan'],
  category: 'fun',
  description: { id: 'Cek atribut keberuntungan zodiak menurut data primbon', en: 'Check zodiac lucky attributes from primbon data' },
  usage: '.zodiak <nama zodiak>',
  example: '.zodiak aries',
  cooldown: 5,
}

// Daftar nama sah ala Elaina. Ejaan API memakai "sagitarius" (satu t);
// ejaan umum "sagittarius" diterima lalu dinormalkan ke ejaan API.
export const VALID_ZODIAC = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagitarius', 'capricorn', 'aquarius', 'pisces']

export function normalizeZodiacName(text) {
  const name = String(text || '').trim().toLowerCase().split(/\s+/)[0] || ''
  const canonical = name === 'sagittarius' ? 'sagitarius' : name
  return VALID_ZODIAC.includes(canonical) ? canonical : null
}

export const i18n = {
  id: {
    zodiak: {
      usage: '╭─❏ ⭐ 「 *ZODIAK* 」\n┊ Tulis nama zodiaknya yaa, pilihannya:\n┊ {list}\n┊ ᴄᴏɴᴛᴏʜ: *.zodiak aries*\n╰━━━━━━━',
      title: 'Zodiak Primbon',
      result: '╭─❏ ⭐ 「 *ZODIAK {nama}* 」\n┊ 🔢 ɴᴏᴍᴏʀ: *{nomor}*\n┊ 🌿 ᴀʀᴏᴍᴀ: {aroma}\n┊ 🪐 ᴘʟᴀɴᴇᴛ: {planet}\n┊ 🌸 ʙᴜɴɢᴀ: {bunga}\n┊ 🎨 ᴡᴀʀɴᴀ: {warna}\n┊ 💎 ʙᴀᴛᴜ: {batu}\n┊ 🔥 ᴇʟᴇᴍᴇɴ: {elemen}\n┊ 💕 ᴘᴀꜱᴀɴɢᴀɴ: {pasangan}\n┊\n┊ {deskripsi}\n╰━━━━━━━',
      resultRaw: '╭─❏ ⭐ 「 *ZODIAK {nama}* 」\n┊ {mentah}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *ZODIAK GAGAL* 」\n┊ Mouu, sumber data primbonnya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Zodiak Lain',
    },
  },
  en: {
    zodiak: {
      usage: '╭─❏ ⭐ 「 *ZODIAC* 」\n┊ Write the zodiac name please, the choices are:\n┊ {list}\n┊ ᴇxᴀᴍᴘʟᴇ: *.zodiak aries*\n╰━━━━━━━',
      title: 'Primbon Zodiac',
      result: '╭─❏ ⭐ 「 *ZODIAC {nama}* 」\n┊ 🔢 ɴᴜᴍʙᴇʀꜱ: *{nomor}*\n┊ 🌿 ꜱᴄᴇɴᴛ: {aroma}\n┊ 🪐 ᴘʟᴀɴᴇᴛ: {planet}\n┊ 🌸 ꜰʟᴏᴡᴇʀ: {bunga}\n┊ 🎨 ᴄᴏʟᴏʀ: {warna}\n┊ 💎 ꜱᴛᴏɴᴇ: {batu}\n┊ 🔥 ᴇʟᴇᴍᴇɴᴛ: {elemen}\n┊ 💕 ᴍᴀᴛᴄʜ: {pasangan}\n┊\n┊ {deskripsi}\n╰━━━━━━━',
      resultRaw: '╭─❏ ⭐ 「 *ZODIAC {nama}* 」\n┊ {mentah}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *ZODIAC FAILED* 」\n┊ Mouu, the primbon data source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Zodiac',
    },
  },
}

export const test = { input: '.zodiak aries', expect: /zodiak aries|zodiac aries/i }

export function formatZodiak(t, nama, data) {
  const label = nama.toUpperCase()
  if (!data.lengkap) return t('zodiak.resultRaw', { nama: label, mentah: data.mentah })
  return t('zodiak.result', {
    nama: label,
    nomor: data.nomor,
    aroma: data.aroma,
    planet: data.planet,
    bunga: data.bunga,
    warna: data.warna,
    batu: data.batu,
    elemen: data.elemen,
    pasangan: data.pasangan,
    deskripsi: data.deskripsi,
  })
}

export async function handler(ctx) {
  const nama = normalizeZodiacName(ctx.args?.[0] || ctx.text || '')
  if (!nama) {
    return ctx.reply(ctx.t('zodiak.usage', { list: VALID_ZODIAC.map((z) => `• ${z}`).join('\n┊ ') }))
  }
  let data
  try {
    data = await getZodiak(nama)
  } catch (err) {
    return ctx.reply(ctx.t('zodiak.fail', { message: err.message }))
  }
  const body = formatZodiak(ctx.t, nama, data)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('zodiak.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('zodiak.btnAgain'), id: '.zodiak' }],
    textFallback: body,
  })
}

/* -------- Helper tanggal lahir lama (murni, masih dipakai tes) -------- */

// Tabel murni: [bulan mulai, hari mulai, kunci zodiak]. Urutan dari Capricorn
// (yang membungkus pergantian tahun) memakai batas awal tiap tanda.
export const ZODIAC_SIGNS = [
  { key: 'capricorn', name: 'Capricorn', start: [12, 22], trait: { id: 'Rajin, sabar, dan kalau sudah punya target susah digoyahkan.', en: 'Hardworking, patient, and hard to sway once a goal is set.' } },
  { key: 'aquarius', name: 'Aquarius', start: [1, 20], trait: { id: 'Pikirannya unik, suka ide baru, dan senang membantu banyak orang.', en: 'Unique thinker, loves new ideas, and enjoys helping many people.' } },
  { key: 'pisces', name: 'Pisces', start: [2, 19], trait: { id: 'Perasa, imajinatif, dan gampang iba melihat orang kesusahan.', en: 'Sensitive, imaginative, and quick to empathize with others.' } },
  { key: 'aries', name: 'Aries', start: [3, 21], trait: { id: 'Berani, enerjik, dan selalu ingin jadi yang pertama mencoba.', en: 'Brave, energetic, and always eager to try things first.' } },
  { key: 'taurus', name: 'Taurus', start: [4, 20], trait: { id: 'Tenang, setia, dan pencinta kenyamanan serta makanan enak.', en: 'Calm, loyal, and a lover of comfort and good food.' } },
  { key: 'gemini', name: 'Gemini', start: [5, 21], trait: { id: 'Ceria, cepat bosan, dan jago bikin obrolan jadi hidup.', en: 'Cheerful, easily bored, and great at livening up conversations.' } },
  { key: 'cancer', name: 'Cancer', start: [6, 21], trait: { id: 'Penyayang, peka, dan keluarga selalu jadi prioritas utama.', en: 'Caring, sensitive, and family always comes first.' } },
  { key: 'leo', name: 'Leo', start: [7, 23], trait: { id: 'Percaya diri, hangat, dan diam-diam suka jadi pusat perhatian.', en: 'Confident, warm, and secretly loves being the center of attention.' } },
  { key: 'virgo', name: 'Virgo', start: [8, 23], trait: { id: 'Teliti, rapi, dan puas kalau semua hal berjalan sesuai rencana.', en: 'Detail oriented, tidy, and satisfied when everything goes to plan.' } },
  { key: 'libra', name: 'Libra', start: [9, 23], trait: { id: 'Suka damai, adil, dan paling susah memilih di antara dua pilihan bagus.', en: 'Peace loving, fair, and struggles to pick between two good options.' } },
  { key: 'scorpio', name: 'Scorpio', start: [10, 23], trait: { id: 'Serius, penuh tekad, dan kalau sudah sayang, sayangnya total.', en: 'Serious, determined, and loves wholeheartedly once attached.' } },
  { key: 'sagittarius', name: 'Sagittarius', start: [11, 22], trait: { id: 'Petualang, jujur, dan selalu punya rencana jalan-jalan berikutnya.', en: 'Adventurous, honest, and always planning the next trip.' } },
]

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// Fungsi murni untuk tes: dari (hari, bulan) kembalikan tanda zodiak.
export function zodiacFor(day, month) {
  const d = Number(day)
  const m = Number(month)
  if (!Number.isInteger(d) || !Number.isInteger(m) || m < 1 || m > 12 || d < 1 || d > DAYS_IN_MONTH[m - 1]) {
    return null
  }
  // Tanda dengan tanggal mulai terbesar yang sudah dilewati menang;
  // sebelum 20 Januari tidak ada yang cocok, jatuh ke Capricorn (pembungkus tahun).
  const value = m * 100 + d
  let result = ZODIAC_SIGNS[0]
  let best = -1
  for (const sign of ZODIAC_SIGNS) {
    const sv = sign.start[0] * 100 + sign.start[1]
    if (sv <= value && sv > best) {
      best = sv
      result = sign
    }
  }
  return result
}

export function parseBirthDate(text) {
  const m = String(text ?? '').trim().match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?$/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  if (!zodiacFor(day, month)) return null
  return { day, month, year: m[3] ? Number(m[3]) : null }
}
