import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ingatkan',
  alias: ['remind'],
  category: 'user',
  description: { id: 'Pasang pengingat pribadi, KANA kirim saat waktunya tiba', en: 'Set a personal reminder, KANA sends it when it is due' },
  usage: '.ingatkan <menit> <teks> | .ingatkan list | .ingatkan batal <n>',
  example: '.ingatkan 30 minum air ya',
  cooldown: 3,
}

export const i18n = {
  id: {
    ingatkan: {
      usage: '╭─❏ ⏰ 「 *PENGINGAT* 」\n┊ Pakai gini yaa:\n┊ .ingatkan <menit> <teks pengingat>\n┊ .ingatkan list\n┊ .ingatkan batal <nomor>\n┊ Menitnya 1 sampai 10080 (seminggu)~\n╰━━━━━━━',
      badMinutes: '╭─❏ ⚠️ 「 *MENIT TIDAK VALID* 」\n┊ Menitnya harus angka bulat 1 sampai 10080 yaa~\n╰━━━━━━━',
      saved: '╭─❏ ⏰ 「 *PENGINGAT TERPASANG* 」\n┊ *"{text}"*\n┊ ᴅᴀʟᴀᴍ: *{minutes} menit*\n┊ ꜱᴇᴋɪᴛᴀʀ: *{time} WIB*~ (•̀ᴗ•́)و\n╰━━━━━━━',
      empty: '╭─❏ ⏰ 「 *PENGINGAT AKTIF* 」\n┊ Belum ada pengingat aktif nih~\n┊ Pasang pakai *.ingatkan <menit> <teks>* yaa 🌸\n╰━━━━━━━',
      listTitle: '╭─❏ ⏰ 「 *PENGINGAT AKTIF {name}* 」',
      listItem: '┊ {n}. *{time} WIB* : {text}',
      cancelled: '╭─❏ ⏰ 「 *PENGINGAT DIBATALKAN* 」\n┊ Pengingat nomor *{n}* dibatalkan: *"{text}"*~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PENGINGAT TIDAK ADA* 」\n┊ Pengingat nomor *{n}* nggak ada (╥﹏╥)\n╰━━━━━━━',
      btnList: 'Pengingat Aktif',
    },
  },
  en: {
    ingatkan: {
      usage: '╭─❏ ⏰ 「 *REMINDER* 」\n┊ Use it like this:\n┊ .ingatkan <minutes> <reminder text>\n┊ .ingatkan list\n┊ .ingatkan batal <number>\n┊ Minutes from 1 to 10080 (a week)~\n╰━━━━━━━',
      badMinutes: '╭─❏ ⚠️ 「 *INVALID MINUTES* 」\n┊ The minutes must be a whole number from 1 to 10080~\n╰━━━━━━━',
      saved: '╭─❏ ⏰ 「 *REMINDER SET* 」\n┊ *"{text}"*\n┊ ɪɴ: *{minutes} minutes*\n┊ ᴀʀᴏᴜɴᴅ: *{time} WIB*~ (•̀ᴗ•́)و\n╰━━━━━━━',
      empty: '╭─❏ ⏰ 「 *ACTIVE REMINDERS* 」\n┊ No active reminders yet~\n┊ Set one with *.ingatkan <minutes> <text>* 🌸\n╰━━━━━━━',
      listTitle: '╭─❏ ⏰ 「 *{name} ACTIVE REMINDERS* 」',
      listItem: '┊ {n}. *{time} WIB* : {text}',
      cancelled: '╭─❏ ⏰ 「 *REMINDER CANCELLED* 」\n┊ Reminder number *{n}* cancelled: *"{text}"*~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *REMINDER NOT FOUND* 」\n┊ Reminder number *{n}* does not exist (╥﹏╥)\n╰━━━━━━━',
      btnList: 'Active Reminders',
    },
  },
}

function formatWib(ts) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(ts))
}

async function loadReminders(ctx) {
  const saved = await ctx.storage.get('reminders', ctx.senderDigits)
  return Array.isArray(saved) ? saved : []
}

async function withButtons(ctx, body) {
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('ingatkan.btnList'), id: '.ingatkan list' },
    ],
    textFallback: body,
  })
}

export const test = { input: '.ingatkan list', expect: /pengingat/i }

export async function handler(ctx) {
  const sub = (ctx.args[0] || '').toLowerCase()

  if (sub === 'list') {
    const items = await loadReminders(ctx)
    if (!items.length) return withButtons(ctx, ctx.t('ingatkan.empty'))
    const body = [
      ctx.t('ingatkan.listTitle', { name: ctx.pushName || ctx.senderDigits }),
      ...items.map((it, i) => ctx.t('ingatkan.listItem', { n: i + 1, time: formatWib(it.at), text: it.text })),
      '╰━━━━━━━',
    ].join('\n')
    return withButtons(ctx, body)
  }

  if (sub === 'batal') {
    const items = await loadReminders(ctx)
    const n = Number(ctx.args[1])
    if (!Number.isInteger(n) || n < 1 || n > items.length) return ctx.reply(ctx.t('ingatkan.notFound', { n: ctx.args[1] || '-' }))
    const [removed] = items.splice(n - 1, 1)
    if (items.length) await ctx.storage.set('reminders', ctx.senderDigits, items)
    else await ctx.storage.delete('reminders', ctx.senderDigits)
    return withButtons(ctx, ctx.t('ingatkan.cancelled', { n, text: removed.text }))
  }

  const minutes = Number(ctx.args[0])
  const text = ctx.args.slice(1).join(' ').trim()
  if (!text) return ctx.reply(ctx.t('ingatkan.usage'))
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 10080) return ctx.reply(ctx.t('ingatkan.badMinutes'))
  const items = await loadReminders(ctx)
  const at = Date.now() + minutes * 60000
  items.push({ at, text, chat: ctx.chat })
  await ctx.storage.set('reminders', ctx.senderDigits, items)
  return withButtons(ctx, ctx.t('ingatkan.saved', { text, minutes, time: formatWib(at) }))
}
