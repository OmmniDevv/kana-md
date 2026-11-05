// Pengingat makan harian berulang. Tersimpan di namespace
// 'daily_reminders' dan dikirim scheduler bot tiap hari pada jam WIB
// yang dipilih. Bawaan jam 12:00 (makan siang).
export const config = {
  name: 'notifmakan',
  alias: ['ingatmakan', 'notifmkn'],
  category: 'utility',
  description: { id: 'Pasang pengingat makan harian pada jam WIB pilihan', en: 'Set a daily meal reminder at a chosen WIB time' },
  usage: '.notifmakan [HH:MM|off|list]',
  example: '.notifmakan 12:00',
  cooldown: 3,
}

export const i18n = {
  id: {
    notifmakan: {
      usage: '╭─❏ 🍽️ 「 *NOTIF MAKAN* 」\n┊ *.notifmakan* pasang bawaan jam 12:00\n┊ *.notifmakan 19:00* pasang jam lain (WIB)\n┊ *.notifmakan list* lihat status\n┊ *.notifmakan off* matikan\n╰━━━━━━━',
      badTime: '╭─❏ ⚠️ 「 *FORMAT JAM SALAH* 」\n┊ Pakai format *HH:MM* ya, contoh 12:00~\n╰━━━━━━━',
      saved: '╭─❏ 🍽️ 「 *NOTIF MAKAN AKTIF* 」\n┊ KANA ingatkan makan tiap hari jam *{time} WIB* di chat ini~\n┊ Matikan dengan *.notifmakan off*.\n╰━━━━━━━',
      off: '╭─❏ 🍽️ 「 *NOTIF MAKAN MATI* 」\n┊ Pengingat makannya sudah dimatikan~\n╰━━━━━━━',
      statusOn: '╭─❏ 🍽️ 「 *STATUS NOTIF MAKAN* 」\n┊ ᴀᴋᴛɪꜰ ᴛɪᴀᴘ ʜᴀʀɪ ᴊᴀᴍ *{time} WIB*~\n╰━━━━━━━',
      statusOff: '╭─❏ 🍽️ 「 *STATUS NOTIF MAKAN* 」\n┊ ʙᴇʟᴜᴍ ᴀᴋᴛɪꜰ. ᴘᴀꜱᴀɴɢ ᴘᴀᴋᴀɪ *.notifmakan* ʏᴀ~\n╰━━━━━━━',
      reminderText: '🍽️ Waktunya makan ya, jangan sampai telat makan. Selamat makan~',
    },
  },
  en: {
    notifmakan: {
      usage: '╭─❏ 🍽️ 「 *MEAL NOTIF* 」\n┊ *.notifmakan* set the 12:00 default\n┊ *.notifmakan 19:00* set another time (WIB)\n┊ *.notifmakan list* see status\n┊ *.notifmakan off* turn off\n╰━━━━━━━',
      badTime: '╭─❏ ⚠️ 「 *BAD TIME FORMAT* 」\n┊ Use *HH:MM*, for example 12:00~\n╰━━━━━━━',
      saved: '╭─❏ 🍽️ 「 *MEAL NOTIF ON* 」\n┊ KANA will remind you to eat every day at *{time} WIB* in this chat~\n┊ Turn it off with *.notifmakan off*.\n╰━━━━━━━',
      off: '╭─❏ 🍽️ 「 *MEAL NOTIF OFF* 」\n┊ The meal reminder is off~\n╰━━━━━━━',
      statusOn: '╭─❏ 🍽️ 「 *MEAL NOTIF STATUS* 」\n┊ ᴀᴄᴛɪᴠᴇ ᴇᴠᴇʀʏ ᴅᴀʏ ᴀᴛ *{time} WIB*~\n╰━━━━━━━',
      statusOff: '╭─❏ 🍽️ 「 *MEAL NOTIF STATUS* 」\n┊ ɴᴏᴛ ᴀᴄᴛɪᴠᴇ ʏᴇᴛ. ꜱᴇᴛ ɪᴛ ᴡɪᴛʜ *.notifmakan*~\n╰━━━━━━━',
      reminderText: '🍽️ Time to eat, do not skip your meal. Enjoy~',
    },
  },
}

export const test = { input: '.notifmakan list', expect: /NOTIF MAKAN|MEAL NOTIF/ }

const KIND = 'makan'
const DEFAULT_TIME = '12:00'

async function loadItems(ctx) {
  const items = await ctx.storage.get('daily_reminders', ctx.senderDigits)
  return Array.isArray(items) ? items : []
}

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const items = await loadItems(ctx)
  const mine = items.find((it) => it?.kind === KIND && it?.chat === ctx.chat)
  if (arg === 'list' || arg === 'status') {
    if (mine) return ctx.reply(ctx.t('notifmakan.statusOn', { time: mine.hhmm }))
    return ctx.reply(ctx.t('notifmakan.statusOff'))
  }
  if (arg === 'off' || arg === 'mati' || arg === 'hapus') {
    const rest = items.filter((it) => !(it?.kind === KIND && it?.chat === ctx.chat))
    if (rest.length) await ctx.storage.set('daily_reminders', ctx.senderDigits, rest)
    else await ctx.storage.delete('daily_reminders', ctx.senderDigits)
    return ctx.reply(ctx.t('notifmakan.off'))
  }
  const time = arg === '' || arg === 'on' ? DEFAULT_TIME : arg
  if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time)) {
    if (arg) return ctx.reply(ctx.t('notifmakan.badTime'))
    return ctx.reply(ctx.t('notifmakan.usage'))
  }
  const hhmm = time.split(':').map((s) => s.padStart(2, '0')).join(':')
  const rest = items.filter((it) => !(it?.kind === KIND && it?.chat === ctx.chat))
  rest.push({ hhmm, text: ctx.t('notifmakan.reminderText'), chat: ctx.chat, kind: KIND, lastSent: '' })
  await ctx.storage.set('daily_reminders', ctx.senderDigits, rest)
  return ctx.reply(ctx.t('notifmakan.saved', { time: hhmm }))
}
