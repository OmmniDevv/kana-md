// Pengingat berbasis jam dinding WIB: .remind 19:30 <teks> untuk sekali
// kirim pada jam itu (hari ini, atau besok bila jamnya sudah lewat),
// .remind 30m <teks> untuk 30 menit lagi. Disimpan di namespace
// 'reminders' yang sama dengan .ingatkan dan dikirim scheduler yang
// sama, jadi .remind list dan .ingatkan list saling melihat.
export const config = {
  name: 'remind',
  alias: ['remindme'],
  category: 'utility',
  description: { id: 'Pasang pengingat jam tertentu WIB atau menit relatif', en: 'Set a reminder for a WIB clock time or relative minutes' },
  usage: '.remind <HH:MM|30m> <teks> | .remind list | .remind batal <n>',
  example: '.remind 19:30 jangan lupa belajar',
  cooldown: 3,
}

export const i18n = {
  id: {
    remind: {
      usage: '╭─❏ ⏰ 「 *REMIND* 」\n┊ ᴘᴀꜱᴀɴɢ: *.remind 19:30 teksnya* (jam WIB)\n┊ ᴀᴛᴀᴜ: *.remind 30m teksnya* (30 menit lagi)\n┊ ʟɪʜᴀᴛ: *.remind list*\n┊ ʙᴀᴛᴀʟ: *.remind batal <nomor>*\n╰━━━━━━━',
      badTime: '╭─❏ ⚠️ 「 *FORMAT WAKTU SALAH* 」\n┊ Pakai format *19:30* (WIB) atau *30m* ya~\n╰━━━━━━━',
      saved: '╭─❏ ⏰ 「 *PENGINGAT TERPASANG* 」\n┊ *"{text}"*\n┊ ᴋɪʀɪᴍ: *{when} WIB*\n╰━━━━━━━',
      empty: '╭─❏ ⏰ 「 *PENGINGAT AKTIF* 」\n┊ Belum ada pengingat aktif nih~\n╰━━━━━━━',
      listTitle: '╭─❏ ⏰ 「 *PENGINGAT AKTIF* 」',
      listItem: '┊ {n}. *{time} WIB* : {text}',
      listFooter: '╰━━━━━━━',
      cancelled: '╭─❏ ⏰ 「 *PENGINGAT DIBATALKAN* 」\n┊ Pengingat nomor *{n}* dibatalkan~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PENGINGAT TIDAK ADA* 」\n┊ Pengingat nomor *{n}* nggak ada~\n╰━━━━━━━',
    },
  },
  en: {
    remind: {
      usage: '╭─❏ ⏰ 「 *REMIND* 」\n┊ ꜱᴇᴛ: *.remind 19:30 the text* (WIB clock)\n┊ ᴏʀ: *.remind 30m the text* (in 30 minutes)\n┊ ʟɪꜱᴛ: *.remind list*\n┊ ᴄᴀɴᴄᴇʟ: *.remind batal <number>*\n╰━━━━━━━',
      badTime: '╭─❏ ⚠️ 「 *BAD TIME FORMAT* 」\n┊ Use *19:30* (WIB) or *30m*~\n╰━━━━━━━',
      saved: '╭─❏ ⏰ 「 *REMINDER SET* 」\n┊ *"{text}"*\n┊ ꜰɪʀᴇꜱ: *{when} WIB*\n╰━━━━━━━',
      empty: '╭─❏ ⏰ 「 *ACTIVE REMINDERS* 」\n┊ No active reminders yet~\n╰━━━━━━━',
      listTitle: '╭─❏ ⏰ 「 *ACTIVE REMINDERS* 」',
      listItem: '┊ {n}. *{time} WIB* : {text}',
      listFooter: '╰━━━━━━━',
      cancelled: '╭─❏ ⏰ 「 *REMINDER CANCELLED* 」\n┊ Reminder number *{n}* cancelled~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *REMINDER NOT FOUND* 」\n┊ Reminder number *{n}* does not exist~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.remind list', expect: /PENGINGAT|REMINDER/ }

// Hitung epoch ms untuk jam HH:MM WIB berikutnya (hari ini/besok).
export function nextWibTime(hhmm, nowMs = Date.now()) {
  const m = String(hhmm || '').match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!m) return null
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(nowMs))
  const get = (type) => parts.find((p) => p.type === type)?.value
  let at = Date.UTC(Number(get('year')), Number(get('month')) - 1, Number(get('day')), Number(m[1]) - 7, Number(m[2]))
  if (at <= nowMs) at += 24 * 3600 * 1000
  return at
}

// Urai argumen pertama menjadi epoch target; sisa teks adalah isi.
export function parseRemindArgs(text, nowMs = Date.now()) {
  const src = String(text || '').trim()
  const rel = src.match(/^(\d{1,5})\s*(m|mnt|menit)\s+([\s\S]+)$/i)
  if (rel) {
    const minutes = Number(rel[1])
    if (minutes >= 1 && minutes <= 10080) return { at: nowMs + minutes * 60000, text: rel[3].trim() }
    return null
  }
  const abs = src.match(/^(\d{1,2}:\d{2})\s+([\s\S]+)$/)
  if (abs) {
    const at = nextWibTime(abs[1], nowMs)
    if (at) return { at, text: abs[2].trim() }
  }
  return null
}

function formatWib(ts) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(ts))
}

export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  const items = (await ctx.storage.get('reminders', ctx.senderDigits)) || []
  const list = Array.isArray(items) ? items : []
  const sub = (raw.split(/\s+/)[0] || '').toLowerCase()
  if (sub === 'list') {
    if (!list.length) return ctx.reply(ctx.t('remind.empty'))
    const lines = [ctx.t('remind.listTitle')]
    list.forEach((it, i) => lines.push(ctx.t('remind.listItem', { n: i + 1, time: formatWib(it.at), text: it.text })))
    lines.push(ctx.t('remind.listFooter'))
    return ctx.reply(lines.join('\n'))
  }
  if (sub === 'batal' || sub === 'hapus' || sub === 'cancel') {
    const n = Number(raw.split(/\s+/)[1])
    if (!n || !list[n - 1]) return ctx.reply(ctx.t('remind.notFound', { n: n || '-' }))
    list.splice(n - 1, 1)
    if (list.length) await ctx.storage.set('reminders', ctx.senderDigits, list)
    else await ctx.storage.delete('reminders', ctx.senderDigits)
    return ctx.reply(ctx.t('remind.cancelled', { n }))
  }
  if (!raw) return ctx.reply(ctx.t('remind.usage'))
  const parsed = parseRemindArgs(raw)
  if (!parsed) return ctx.reply(ctx.t('remind.badTime'))
  list.push({ at: parsed.at, text: parsed.text, chat: ctx.chat })
  await ctx.storage.set('reminders', ctx.senderDigits, list)
  return ctx.reply(ctx.t('remind.saved', { text: parsed.text, when: formatWib(parsed.at) }))
}
