import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'zodiak',
  alias: ['zodiac'],
  category: 'fun',
  description: { id: 'Cek zodiak dari tanggal lahir plus sifat umumnya, untuk hiburan', en: 'Check your zodiac sign from your birth date plus general traits, for fun' },
  usage: '╭─❏ ✨ 「 *ZODIAK* 」\n┊ .zodiak <DD-MM atau DD-MM-YYYY>\n╰━━━━━━━',
  example: '.zodiak 17-08',
  cooldown: 3,
}

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

export const i18n = {
  id: {
    zodiak: {
      usage: '╭─❏ ✨ 「 *ZODIAK* 」\n┊ Pakai: .zodiak <tanggal lahir>, contoh .zodiak 17-08 atau .zodiak 17-08-2008 yaa~\n╰━━━━━━━',
      result: '╭─❏ ✨ 「 *ZODIAK KAMU ✨* 」\n┊ ᴛᴀɴɢɢᴀʟ: {date}\n┊ ᴢᴏᴅɪᴀᴋ: *{sign}*\n┊ ꜱɪꜰᴀᴛ ᴜᴍᴜᴍɴʏᴀ: {trait}\n┊ Kira-kira cocok tidak sama kamu? Ehehe~ {mood}\n┊ {disclaimer}\n╰━━━━━━━',
      disclaimer: 'Catatan: ini cuma hiburan ringan dari KANA yaa, sifat orang tidak ditentukan tanggal lahir kok~',
      againBtn: '✨ Cek Zodiak Lagi',
      footer: 'Cek-cek hiburan KANA',
    },
  },
  en: {
    zodiak: {
      usage: '╭─❏ ✨ 「 *ZODIAC* 」\n┊ Use: .zodiak <birth date>, for example .zodiak 17-08 or .zodiak 17-08-2008~\n╰━━━━━━━',
      result: '╭─❏ ✨ 「 *YOUR ZODIAC ✨* 」\n┊ ᴅᴀᴛᴇ: {date}\n┊ ꜱɪɢɴ: *{sign}*\n┊ ɢᴇɴᴇʀᴀʟ ᴛʀᴀɪᴛꜱ: {trait}\n┊ Does it sound like you? Ehehe~ {mood}\n┊ {disclaimer}\n╰━━━━━━━',
      disclaimer: 'Note: this is just light fun from KANA, a birth date does not define a person~',
      againBtn: '✨ Check Zodiac Again',
      footer: 'KANA fun checks',
    },
  },
}

export const test = { input: '.zodiak 17-08', expect: /zodiak/i }

export async function handler(ctx) {
  const parsed = parseBirthDate(ctx.text || ctx.args?.[0] || '')
  if (!parsed) return ctx.reply(ctx.t('zodiak.usage'))
  const sign = zodiacFor(parsed.day, parsed.month)
  const date = `${String(parsed.day).padStart(2, '0')}-${String(parsed.month).padStart(2, '0')}${parsed.year ? `-${parsed.year}` : ''}`
  const body = ctx.t('zodiak.result', {
    date,
    sign: sign.name,
    trait: sign.trait[ctx.lang] ?? sign.trait.id,
    mood: ctx.say('senang'),
    disclaimer: ctx.t('zodiak.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('zodiak.footer'),
    replies: [
      { text: ctx.t('zodiak.againBtn'), id: '.zodiak' },
    ],
    textFallback: body,
  })
}
