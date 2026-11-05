// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent. Sekarang hitungan NYATA dari tanggal lahir yang
// diberikan: umur saat ini, jumlah hari yang sudah dijalani, dan sisa
// hari menuju ulang tahun berikutnya. KANA tidak menebak sisa umur
// hidup seseorang; yang ditampilkan hanya hitungan kalender yang pasti.
export const config = {
  name: 'ceksisaumur',
  alias: [],
  category: 'cek',
  description: { id: 'Hitung umur nyata dari tanggal lahir: umur sekarang, hari yang sudah dijalani, dan sisa hari ke ulang tahun berikutnya', en: 'Compute real age from a birthdate: current age, days lived, and days left to the next birthday' },
  usage: '.ceksisaumur <tanggal lahir>',
  example: '.ceksisaumur 2008-05-17',
  cooldown: 5,
}

export const i18n = {
  id: {
    ceksisaumur: {
      usage: '╭─❏ 🎂 「 *CEK SISA UMUR* 」\n┊ Tulis tanggal lahirmu yaa, contoh: *.ceksisaumur 2008-05-17*\n┊ Format lain yang diterima: 17-05-2008 atau 17/05/2008\n╰━━━━━━━',
      future: '╭─❏ 🎂 「 *CEK SISA UMUR* 」\n┊ Tanggal lahirnya masih di masa depan, belum bisa dihitung~\n╰━━━━━━━',
      result: '╭─❏ 🎂 「 *CEK SISA UMUR* 」\n┊ ᴛᴀɴɢɢᴀʟ ʟᴀʜɪʀ: *{birth}*\n┊ UMUR SEKARANG: *{age} tahun*\n┊ SUDAH HIDUP: *{days} hari*\n┊ ULANG TAHUN BERIKUTNYA: *{nextAge} tahun* dalam *{remain} hari* lagi\n┊ \n┊ Ini hitungan kalender yang pasti yaa; sisa umur hidup seseorang tidak ada yang bisa menebak~\n╰━━━━━━━',
    },
  },
  en: {
    ceksisaumur: {
      usage: '╭─❏ 🎂 「 *AGE CHECK* 」\n┊ Write your birthdate please, example: *.ceksisaumur 2008-05-17*\n┊ Other accepted formats: 17-05-2008 or 17/05/2008\n╰━━━━━━━',
      future: '╭─❏ 🎂 「 *AGE CHECK* 」\n┊ That birthdate is still in the future, cannot compute it~\n╰━━━━━━━',
      result: '╭─❏ 🎂 「 *AGE CHECK* 」\n┊ ʙɪʀᴛʜᴅᴀᴛᴇ: *{birth}*\n┊ CURRENT AGE: *{age} years*\n┊ DAYS LIVED: *{days} days*\n┊ NEXT BIRTHDAY: *{nextAge} years old* in *{remain} days*\n┊ \n┊ This is exact calendar math; nobody can guess a person remaining lifespan~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ceksisaumur 2008-05-17', expect: /sudah hidup|days lived/i }

const DAY_MS = 86400000

// Terima YYYY-MM-DD, DD-MM-YYYY, atau DD/MM/YYYY. Null bila tidak valid.
export function parseBirthdate(raw) {
  const s = String(raw ?? '').trim()
  let y, m, d
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (match) { y = +match[1]; m = +match[2]; d = +match[3] }
  else {
    match = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
    if (!match) return null
    d = +match[1]; m = +match[2]; y = +match[3]
  }
  if (y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) return null
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null
  return date
}

export function ageInfo(birth, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const born = birth.getTime()
  const daysLived = Math.floor((today - born) / DAY_MS)
  let age = now.getUTCFullYear() - birth.getUTCFullYear()
  let nextBirthday = Date.UTC(now.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate())
  const thisYearBirthday = nextBirthday
  const birthdayPassed = today >= thisYearBirthday
  if (!birthdayPassed) {
    age -= 1
  } else {
    nextBirthday = Date.UTC(now.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate())
  }
  const remainDays = Math.round((nextBirthday - today) / DAY_MS)
  return { age, daysLived, nextAge: age + 1, remainDays }
}

export async function handler(ctx) {
  const birth = parseBirthdate(ctx.args?.[0] ?? ctx.text ?? '')
  if (!birth) return ctx.reply(ctx.t('ceksisaumur.usage'))
  if (birth.getTime() > Date.now()) return ctx.reply(ctx.t('ceksisaumur.future'))
  const info = ageInfo(birth)
  const birthLabel = birth.toISOString().slice(0, 10)
  return ctx.reply(ctx.t('ceksisaumur.result', {
    birth: birthLabel, age: info.age, days: info.daysLived.toLocaleString('id-ID'), nextAge: info.nextAge, remain: info.remainDays,
  }))
}
