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
      ask: '╭─❏ 🎂 「 *ULANG TAHUN* 」\n┊ Simpan ultahmu dengan: *.birthday set 17-08-2008*\n┊ Lihat daftar dengan *.birthday list* yaa~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ ⚠️ 「 *TANGGAL TIDAK VALID* 」\n┊ Pakai format DD-MM-YYYY yang beneran ada yaa~\n╰━━━━━━━ {mood}',
      saved: '╭─❏ 🎂 「 *ULTAH TERSIMPAN* 」\n┊ ᴜʟᴛᴀʜᴍᴜ: *{date}*\n┊ ꜱɪꜱᴀ: *{days} hari lagi* menuju ultah berikutnya~\n╰━━━━━━━ {mood}',
      mine: '╭─❏ 🎂 「 *ULTAHMU* 」\n┊ ᴛᴀɴɢɢᴀʟ: *{date}*\n┊ ꜱɪꜱᴀ: *{days} hari lagi*\n╰━━━━━━━ {mood}',
      notSet: '╭─❏ 🎂 「 *ULANG TAHUN* 」\n┊ Ultahmu belum tersimpan nih.\n┊ Simpan dengan *.birthday set DD-MM-YYYY* yaa~\n╰━━━━━━━ {mood}',
      listTitle: '╭─❏ 🎂 「 *DAFTAR ULANG TAHUN* 」',
      listEmpty: '╭─❏ 🎂 「 *DAFTAR ULANG TAHUN* 」\n┊ Belum ada ultah yang tersimpan nih.\n┊ Jadi yang pertama yuk: *.birthday set DD-MM-YYYY*\n╰━━━━━━━ {mood}',
      listLine: '┊ • {name}: *{date}* (ꜱɪꜱᴀ *{days} ʜᴀʀɪ*)',
      btnSet: '🎂 Simpan Punyaku',
      btnList: '🎂 Lihat Daftar',
    },
  },
  en: {
    birthday: {
      title: 'Birthday',
      ask: '╭─❏ 🎂 「 *BIRTHDAY* 」\n┊ Save yours with: *.birthday set 17-08-2008*\n┊ See the list with *.birthday list*~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ ⚠️ 「 *INVALID DATE* 」\n┊ Use a real DD-MM-YYYY date~\n╰━━━━━━━ {mood}',
      saved: '╭─❏ 🎂 「 *BIRTHDAY SAVED* 」\n┊ ʏᴏᴜʀ ʙɪʀᴛʜᴅᴀʏ: *{date}*\n┊ ʟᴇꜰᴛ: *{days} days* until the next one~\n╰━━━━━━━ {mood}',
      mine: '╭─❏ 🎂 「 *YOUR BIRTHDAY* 」\n┊ ᴅᴀᴛᴇ: *{date}*\n┊ ʟᴇꜰᴛ: *{days} days*\n╰━━━━━━━ {mood}',
      notSet: '╭─❏ 🎂 「 *BIRTHDAY* 」\n┊ Your birthday is not saved yet.\n┊ Save it with *.birthday set DD-MM-YYYY*~\n╰━━━━━━━ {mood}',
      listTitle: '╭─❏ 🎂 「 *SAVED BIRTHDAY LIST* 」',
      listEmpty: '╭─❏ 🎂 「 *SAVED BIRTHDAY LIST* 」\n┊ No birthdays saved yet.\n┊ Be the first: *.birthday set DD-MM-YYYY*\n╰━━━━━━━ {mood}',
      listLine: '┊ • {name}: *{date}* (*{days} days* ʟᴇꜰᴛ)',
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
    const body = `${ctx.t('birthday.listTitle')}\n${rows.map((r) => ctx.t('birthday.listLine', r)).join('\n')}\n╰━━━━━━━`
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
