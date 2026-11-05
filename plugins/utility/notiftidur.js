// Pengingat tidur harian berulang. Tersimpan di namespace
// 'daily_reminders' dan dikirim scheduler bot tiap hari pada jam WIB
// yang dipilih. Bawaan jam 21:30.
export const config = {
  name: 'notiftidur',
  alias: ['ingattidur', 'notiftidurmalam'],
  category: 'utility',
  description: { id: 'Pasang pengingat tidur harian pada jam WIB pilihan', en: 'Set a daily sleep reminder at a chosen WIB time' },
  usage: '.notiftidur [HH:MM|off|list]',
  example: '.notiftidur 21:30',
  cooldown: 3,
}

export const i18n = {
  id: {
    notiftidur: {
      usage: '╭─❏ 🌙 「 *NOTIF TIDUR* 」\n┊ *.notiftidur* pasang bawaan jam 21:30\n┊ *.notiftidur 22:00* pasang jam lain (WIB)\n┊ *.notiftidur list* lihat status\n┊ *.notiftidur off* matikan\n╰━━━━━━━',
      badTime: '╭─❏ ⚠️ 「 *FORMAT JAM SALAH* 」\n┊ Pakai format *HH:MM* ya, contoh 21:30~\n╰━━━━━━━',
      saved: '╭─❏ 🌙 「 *NOTIF TIDUR AKTIF* 」\n┊ KANA ingatkan tidur tiap hari jam *{time} WIB* di chat ini~\n┊ Matikan dengan *.notiftidur off*.\n╰━━━━━━━',
      off: '╭─❏ 🌙 「 *NOTIF TIDUR MATI* 」\n┊ Pengingat tidurnya sudah dimatikan~\n╰━━━━━━━',
      statusOn: '╭─❏ 🌙 「 *STATUS NOTIF TIDUR* 」\n┊ ᴀᴋᴛɪꜰ ᴛɪᴀᴘ ʜᴀʀɪ ᴊᴀᴍ *{time} WIB*~\n╰━━━━━━━',
      statusOff: '╭─❏ 🌙 「 *STATUS NOTIF TIDUR* 」\n┊ ʙᴇʟᴜᴍ ᴀᴋᴛɪꜰ. ᴘᴀꜱᴀɴɢ ᴘᴀᴋᴀɪ *.notiftidur* ʏᴀ~\n╰━━━━━━━',
      reminderText: '🌙 Sudah malam, waktunya istirahat dan tidur ya. Selamat tidur, mimpi indah~',
    },
  },
  en: {
    notiftidur: {
      usage: '╭─❏ 🌙 「 *SLEEP NOTIF* 」\n┊ *.notiftidur* set the 21:30 default\n┊ *.notiftidur 22:00* set another time (WIB)\n┊ *.notiftidur list* see status\n┊ *.notiftidur off* turn off\n╰━━━━━━━',
      badTime: '╭─❏ ⚠️ 「 *BAD TIME FORMAT* 」\n┊ Use *HH:MM*, for example 21:30~\n╰━━━━━━━',
      saved: '╭─❏ 🌙 「 *SLEEP NOTIF ON* 」\n┊ KANA will remind you to sleep every day at *{time} WIB* in this chat~\n┊ Turn it off with *.notiftidur off*.\n╰━━━━━━━',
      off: '╭─❏ 🌙 「 *SLEEP NOTIF OFF* 」\n┊ The sleep reminder is off~\n╰━━━━━━━',
      statusOn: '╭─❏ 🌙 「 *SLEEP NOTIF STATUS* 」\n┊ ᴀᴄᴛɪᴠᴇ ᴇᴠᴇʀʏ ᴅᴀʏ ᴀᴛ *{time} WIB*~\n╰━━━━━━━',
      statusOff: '╭─❏ 🌙 「 *SLEEP NOTIF STATUS* 」\n┊ ɴᴏᴛ ᴀᴄᴛɪᴠᴇ ʏᴇᴛ. ꜱᴇᴛ ɪᴛ ᴡɪᴛʜ *.notiftidur*~\n╰━━━━━━━',
      reminderText: '🌙 It is late, time to rest and sleep. Good night, sweet dreams~',
    },
  },
}

export const test = { input: '.notiftidur list', expect: /NOTIF TIDUR|SLEEP NOTIF/ }

const KIND = 'tidur'
const DEFAULT_TIME = '21:30'

async function loadItems(ctx) {
  const items = await ctx.storage.get('daily_reminders', ctx.senderDigits)
  return Array.isArray(items) ? items : []
}

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const items = await loadItems(ctx)
  const mine = items.find((it) => it?.kind === KIND && it?.chat === ctx.chat)
  if (arg === 'list' || arg === 'status') {
    if (mine) return ctx.reply(ctx.t('notiftidur.statusOn', { time: mine.hhmm }))
    return ctx.reply(ctx.t('notiftidur.statusOff'))
  }
  if (arg === 'off' || arg === 'mati' || arg === 'hapus') {
    const rest = items.filter((it) => !(it?.kind === KIND && it?.chat === ctx.chat))
    if (rest.length) await ctx.storage.set('daily_reminders', ctx.senderDigits, rest)
    else await ctx.storage.delete('daily_reminders', ctx.senderDigits)
    return ctx.reply(ctx.t('notiftidur.off'))
  }
  const time = arg === '' || arg === 'on' ? DEFAULT_TIME : arg
  if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time)) {
    if (arg) return ctx.reply(ctx.t('notiftidur.badTime'))
    return ctx.reply(ctx.t('notiftidur.usage'))
  }
  const hhmm = time.split(':').map((s) => s.padStart(2, '0')).join(':')
  const rest = items.filter((it) => !(it?.kind === KIND && it?.chat === ctx.chat))
  rest.push({ hhmm, text: ctx.t('notiftidur.reminderText'), chat: ctx.chat, kind: KIND, lastSent: '' })
  await ctx.storage.set('daily_reminders', ctx.senderDigits, rest)
  return ctx.reply(ctx.t('notiftidur.saved', { time: hhmm }))
}
