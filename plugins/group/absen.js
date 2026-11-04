import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { digitsOf } from '../../src/services/guard-rules.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'absen',
  alias: ['kehadiran'],
  category: 'group',
  description: { id: 'Absensi grup: mulai, check in, tutup', en: 'Group attendance: start, check in, close' },
  usage: '.absen <start|check|close>',
  example: '.absen start',
  cooldown: 3,
  isGroup: true,
  needsAdminInfo: true,
}

export const i18n = {
  id: {
    absen: {
      usage: '╭─❏ 📋 「 *ABSEN GRUP* 」\n┊ Pakai: *.absen start*, *.absen check*, atau *.absen close* yaa~\n╰━━━━━━━',
      adminOnly: '╭─❏ 🔒 「 *KHUSUS ADMIN* 」\n┊ Bagian absen grup ini cuma buat admin grup yaa~\n╰━━━━━━━',
      started: '╭─❏ 📋 「 *ABSEN DIMULAI* 」\n┊ Absen dimulai oleh *@{digits}*~\n┊ Silakan ketik *.absen check* buat catat kehadiran kalian yaa!\n╰━━━━━━━',
      already: '╭─❏ 📋 「 *ABSEN LAGI BERJALAN* 」\n┊ Absen lagi berjalan kok, dimulai oleh *{by}*~\n┊ Ketik *.absen check* aja yaa~\n╰━━━━━━━',
      noSession: '╭─❏ 📋 「 *BELUM ADA ABSEN* 」\n┊ Belum ada sesi absen grup yang berjalan~\n┊ Admin bisa mulai dengan *.absen start* yaa~\n╰━━━━━━━',
      checked: '╭─❏ ✅ 「 *KEHADIRAN DICATAT* 」\n┊ Siap, *@{digits}* udah KANA catat hadir~\n┊ Total hadir sekarang *{count} orang*~\n╰━━━━━━━',
      checkedAgain: '╭─❏ 🌸 「 *SUDAH TERCATAT* 」\n┊ *@{digits}* udah tercatat hadir kok dari tadi~\n╰━━━━━━━',
      closed: '╭─❏ 📋 「 *ABSEN DITUTUP* 」\n┊ Hadir *{count} orang*:\n┊ {list}\n╰━━━━━━━\nMakasih semuanya~ {mood}',
      closedEmpty: '╭─❏ 📋 「 *ABSEN DITUTUP* 」\n┊ Belum ada yang check in nih~\n╰━━━━━━━ {mood}',
      line: '{index}. *@{digits}* ({name})',
      footer: 'Absen grup KANA',
      checkBtn: 'Saya hadir', closeBtn: 'Tutup absen', startBtn: 'Mulai absen',
    },
  },
  en: {
    absen: {
      usage: '╭─❏ 📋 「 *GROUP ATTENDANCE* 」\n┊ Use: *.absen start*, *.absen check*, or *.absen close*~\n╰━━━━━━━',
      adminOnly: '╭─❏ 🔒 「 *ADMINS ONLY* 」\n┊ This part of group attendance is for group admins only~\n╰━━━━━━━',
      started: '╭─❏ 📋 「 *ATTENDANCE STARTED* 」\n┊ Attendance started by *@{digits}*~\n┊ Please type *.absen check* to record your presence!\n╰━━━━━━━',
      already: '╭─❏ 📋 「 *ATTENDANCE RUNNING* 」\n┊ Attendance is already running, started by *{by}*~\n┊ Just type *.absen check*~\n╰━━━━━━━',
      noSession: '╭─❏ 📋 「 *NO ATTENDANCE YET* 」\n┊ No group attendance session is running~\n┊ An admin can start with *.absen start*~\n╰━━━━━━━',
      checked: '╭─❏ ✅ 「 *PRESENCE RECORDED* 」\n┊ Got it, *@{digits}* is marked present~\n┊ Total present now *{count} people*~\n╰━━━━━━━',
      checkedAgain: '╭─❏ 🌸 「 *ALREADY RECORDED* 」\n┊ *@{digits}* was already marked present~\n╰━━━━━━━',
      closed: '╭─❏ 📋 「 *ATTENDANCE CLOSED* 」\n┊ Present *{count} people*:\n┊ {list}\n╰━━━━━━━\nThanks everyone~ {mood}',
      closedEmpty: '╭─❏ 📋 「 *ATTENDANCE CLOSED* 」\n┊ Nobody checked in yet~\n╰━━━━━━━ {mood}',
      line: '{index}. *@{digits}* ({name})',
      footer: 'KANA group attendance',
      checkBtn: 'I am present', closeBtn: 'Close attendance', startBtn: 'Start attendance',
    },
  },
}

export const test = { input: '.absen check', expect: /grup|group/i }

export async function handler(ctx) {
  const action = (ctx.args[0] || '').toLowerCase()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const session = settings.absen ?? null

  if (action === 'start') {
    if (!ctx.isAdmin) return ctx.reply(ctx.t('absen.adminOnly'))
    if (session) return ctx.reply(ctx.t('absen.already', { by: session.startedBy }))
    await updateGroupSettings(ctx.storage, ctx.chat, {
      absen: { startedBy: ctx.senderDigits, startedAt: Date.now(), present: {} },
    })
    const body = ctx.t('absen.started', { digits: ctx.senderDigits })
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA', body, footer: ctx.t('absen.footer'),
      replies: [
        { text: ctx.t('absen.checkBtn'), id: '.absen check' },
        { text: ctx.t('absen.closeBtn'), id: '.absen close' },
      ],
      textFallback: body,
    })
    return
  }

  if (action === 'check') {
    if (!session) {
      const body = ctx.t('absen.noSession')
      await sendButtons(ctx.sock, ctx.chat, {
        title: 'KANA', body, footer: ctx.t('absen.footer'),
        replies: [{ text: ctx.t('absen.startBtn'), id: '.absen start' }],
        textFallback: body,
      })
      return
    }
    const present = { ...(session.present ?? {}) }
    if (present[ctx.senderDigits]) return ctx.sock.sendMessage(ctx.chat, { text: ctx.t('absen.checkedAgain', { digits: ctx.senderDigits }), mentions: [ctx.sender] }, { quoted: ctx.raw })
    present[ctx.senderDigits] = ctx.pushName || ctx.senderDigits
    await updateGroupSettings(ctx.storage, ctx.chat, { absen: { ...session, present } })
    const body = ctx.t('absen.checked', { digits: ctx.senderDigits, count: Object.keys(present).length })
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA', body, footer: ctx.t('absen.footer'),
      replies: [{ text: ctx.t('absen.closeBtn'), id: '.absen close' }],
      textFallback: body,
    })
    return
  }

  if (action === 'close') {
    if (!ctx.isAdmin) return ctx.reply(ctx.t('absen.adminOnly'))
    if (!session) return ctx.reply(ctx.t('absen.noSession'))
    const entries = Object.entries(session.present ?? {})
    await updateGroupSettings(ctx.storage, ctx.chat, { absen: null })
    if (!entries.length) return ctx.reply(ctx.t('absen.closedEmpty', { mood: ctx.say('senang') }))
    const list = entries.map(([digits, name], i) => ctx.t('absen.line', { index: i + 1, digits, name })).join('\n┊ ')
    const mentions = entries.map(([digits]) => `${digits}@s.whatsapp.net`)
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('absen.closed', { count: entries.length, list, mood: ctx.say('senang') }),
      mentions,
    }, { quoted: ctx.raw })
    return
  }

  return ctx.reply(ctx.t('absen.usage'))
}
