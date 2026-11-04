export const config = {
  name: 'umur',
  alias: ['age', 'hitungumur', 'cekage', 'cekumur'],
  category: 'user',
  description: { id: 'Hitung umur dari tanggal lahir: tahun, bulan, hari, dan hitung mundur ulang tahun', en: 'Calculate age from a birth date: years, months, days, and birthday countdown' },
  usage: '.umur <DD-MM-YYYY>',
  example: '.umur 17-08-2008',
  cooldown: 3,
}

export const i18n = {
  id: {
    umur: {
      ask: 'Tulis tanggal lahirmu yaa, formatnya DD-MM-YYYY. Contoh: .umur 17-08-2008 {mood}',
      invalid: 'Tanggalnya tidak valid. Pakai format DD-MM-YYYY dan pastikan tanggalnya beneran ada yaa~ {mood}',
      future: 'Tanggal lahirnya masih di masa depan, belum bisa dihitung umurnya~ {mood}',
      body: '🎂 HITUNG UMUR\n\nTanggal lahir: {birth}\nUmur: *{years} tahun, {months} bulan, {days} hari*\nTotal hari hidup: {totalDays} hari\nUlang tahun berikutnya: {nextIn} hari lagi ({nextDate}) {mood}',
    },
  },
  en: {
    umur: {
      ask: 'Write your birth date, format DD-MM-YYYY. Example: .umur 17-08-2008 {mood}',
      invalid: 'That date is not valid. Use DD-MM-YYYY and make sure the date really exists~ {mood}',
      future: 'That birth date is still in the future, the age cannot be counted yet~ {mood}',
      body: '🎂 AGE CALCULATOR\n\nBirth date: {birth}\nAge: *{years} years, {months} months, {days} days*\nTotal days alive: {totalDays} days\nNext birthday: in {nextIn} days ({nextDate}) {mood}',
    },
  },
}

export const test = { input: '.umur 17-08-2008', expect: /umur|age/i }

function todayWib() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const [y, m, d] = parts.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function calcAge(birth, today) {
  let years = today.getUTCFullYear() - birth.getUTCFullYear()
  let months = today.getUTCMonth() - birth.getUTCMonth()
  let days = today.getUTCDate() - birth.getUTCDate()
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0))
    days += prevMonth.getUTCDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  const totalDays = Math.floor((today - birth) / 86400000)
  let next = Date.UTC(today.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate())
  if (next <= today.getTime()) next = Date.UTC(today.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate())
  const nextIn = Math.round((next - today.getTime()) / 86400000)
  return { years, months, days, totalDays, nextIn, nextDate: new Date(next) }
}

const fmt = (d) => `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`

export async function handler(ctx) {
  const m = (ctx.text || '').trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (!m) return ctx.reply(ctx.t('umur.ask', { mood: ctx.say('mikir') }))
  const birth = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])))
  if (birth.getUTCDate() !== Number(m[1]) || birth.getUTCMonth() !== Number(m[2]) - 1) {
    return ctx.reply(ctx.t('umur.invalid', { mood: ctx.say('gagal') }))
  }
  const today = todayWib()
  if (birth > today) return ctx.reply(ctx.t('umur.future', { mood: ctx.say('malu') }))
  const r = calcAge(birth, today)
  return ctx.reply(ctx.t('umur.body', {
    birth: fmt(birth), years: r.years, months: r.months, days: r.days,
    totalDays: r.totalDays.toLocaleString('id-ID'), nextIn: r.nextIn, nextDate: fmt(r.nextDate),
    mood: ctx.say('senang'),
  }))
}
