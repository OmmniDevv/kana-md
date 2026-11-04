import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'birthday',
  alias: ['ultah'],
  category: 'user',
  description: { id: 'Simpan tanggal ulang tahunmu dan lihat daftar ultah yang tersimpan', en: 'Save your birthday and see the saved birthday list' },
  usage: '.birthday set <DD-MM-YYYY> atau .birthday list',
  example: '.birthday set 17-08-2008',
  cooldown: 3,
}

export const i18n = {
  id: {
    birthday: {
      title: 'Ulang Tahun',
      ask: 'Simpan ultahmu dengan: .birthday set 17-08-2008. Lihat daftar dengan .birthday list yaa~ {mood}',
      invalid: 'Tanggalnya tidak valid, pakai format DD-MM-YYYY yang beneran ada yaa~ {mood}',
      saved: '🎂 Ultahmu tersimpan: {date}. Sisa {days} hari lagi menuju ultah berikutnya~ {mood}',
      mine: '🎂 Ultahmu: {date} (sisa {days} hari lagi) {mood}',
      notSet: 'Ultahmu belum tersimpan. Simpan dengan .birthday set DD-MM-YYYY yaa~ {mood}',
      listTitle: '🎂 DAFTAR ULANG TAHUN TERSIMPAN',
      listEmpty: 'Belum ada ultah yang tersimpan. Jadi yang pertama yuk: .birthday set DD-MM-YYYY {mood}',
      listLine: '• {name}: {date} (sisa {days} hari)',
      btnSet: '🎂 Simpan Punyaku',
      btnList: '🎂 Lihat Daftar',
    },
  },
  en: {
    birthday: {
      title: 'Birthday',
      ask: 'Save yours with: .birthday set 17-08-2008. See the list with .birthday list~ {mood}',
      invalid: 'That date is not valid, use a real DD-MM-YYYY date~ {mood}',
      saved: '🎂 Your birthday is saved: {date}. {days} days left until the next one~ {mood}',
      mine: '🎂 Your birthday: {date} ({days} days left) {mood}',
      notSet: 'Your birthday is not saved yet. Save it with .birthday set DD-MM-YYYY~ {mood}',
      listTitle: '🎂 SAVED BIRTHDAY LIST',
      listEmpty: 'No birthdays saved yet. Be the first: .birthday set DD-MM-YYYY {mood}',
      listLine: '• {name}: {date} ({days} days left)',
      btnSet: '🎂 Save Mine',
      btnList: '🎂 View List',
    },
  },
}

export const test = { input: '.birthday', expect: /ulang tahun|birthday/i }

function todayWib() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const [y, m, d] = parts.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function daysUntil(day, month, today) {
  let next = Date.UTC(today.getUTCFullYear(), month - 1, day)
  if (next < today.getTime()) next = Date.UTC(today.getUTCFullYear() + 1, month - 1, day)
  return Math.round((next - today.getTime()) / 86400000)
}

const fmtStored = (iso) => {
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

export async function handler(ctx) {
  const arg = (ctx.text || '').trim()
  const today = todayWib()
  if (arg.toLowerCase() === 'list') {
    const keys = (await ctx.storage.keys('birthdays')) ?? []
    if (!keys.length) return ctx.reply(ctx.t('birthday.listEmpty', { mood: ctx.say('malu') }))
    const rows = []
    for (const digits of keys.slice(0, 30)) {
      const rec = await ctx.storage.get('birthdays', digits)
      if (!rec?.date) continue
      const [, m, d] = rec.date.split('-').map(Number)
      rows.push({ name: rec.name || digits, date: fmtStored(rec.date), days: daysUntil(d, m, today) })
    }
    rows.sort((a, b) => a.days - b.days)
    const body = `${ctx.t('birthday.listTitle')}\n\n${rows.map((r) => ctx.t('birthday.listLine', r)).join('\n')}`
    return ctx.reply(body)
  }
  const setMatch = arg.match(/^set\s+(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/i)
  if (setMatch) {
    const birth = new Date(Date.UTC(Number(setMatch[3]), Number(setMatch[2]) - 1, Number(setMatch[1])))
    if (birth.getUTCDate() !== Number(setMatch[1]) || birth.getUTCMonth() !== Number(setMatch[2]) - 1) {
      return ctx.reply(ctx.t('birthday.invalid', { mood: ctx.say('gagal') }))
    }
    const iso = `${setMatch[3]}-${setMatch[2].padStart(2, '0')}-${setMatch[1].padStart(2, '0')}`
    await ctx.storage.set('birthdays', ctx.senderDigits, { date: iso, name: ctx.pushName || ctx.senderDigits })
    const days = daysUntil(Number(setMatch[1]), Number(setMatch[2]), today)
    return ctx.reply(ctx.t('birthday.saved', { date: fmtStored(iso), days, mood: ctx.say('senang') }))
  }
  if (!arg) {
    const rec = await ctx.storage.get('birthdays', ctx.senderDigits)
    if (!rec?.date) {
      const body = ctx.t('birthday.notSet', { mood: ctx.say('mikir') })
      return sendButtons(ctx.sock, ctx.chat, {
        title: ctx.t('birthday.title'),
        body,
        footer: ctx.t('menu.footer'),
        replies: [{ text: ctx.t('birthday.btnList'), id: '.birthday list' }],
        textFallback: body,
      })
    }
    const [, m, d] = rec.date.split('-').map(Number)
    return ctx.reply(ctx.t('birthday.mine', { date: fmtStored(rec.date), days: daysUntil(d, m, today), mood: ctx.say('senang') }))
  }
  return ctx.reply(ctx.t('birthday.ask', { mood: ctx.say('mikir') }))
}
