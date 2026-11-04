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
      usage: 'Pakai: .absen start, .absen check, atau .absen close yaa~',
      adminOnly: 'Bagian absen ini cuma buat admin grup yaa~',
      started: 'Absen dimulai oleh @{digits}~ Silakan ketik .absen check buat catat kehadiran kalian yaa!',
      already: 'Absen lagi berjalan kok, dimulai oleh {by}. Ketik .absen check aja yaa~',
      noSession: 'Belum ada sesi absen yang berjalan. Admin bisa mulai dengan .absen start yaa~',
      checked: 'Siap, @{digits} udah KANA catat hadir. Total hadir sekarang {count} orang~',
      checkedAgain: '@{digits} udah tercatat hadir kok dari tadi~',
      closed: 'Absen ditutup. Hadir {count} orang:\n{list}\nMakasih semuanya~ {mood}',
      closedEmpty: 'Absen ditutup. Belum ada yang check in nih. {mood}',
      line: '{index}. @{digits} ({name})',
      footer: 'Absen grup KANA',
      checkBtn: 'Saya hadir', closeBtn: 'Tutup absen', startBtn: 'Mulai absen',
    },
  },
  en: {
    absen: {
      usage: 'Use: .absen start, .absen check, or .absen close~',
      adminOnly: 'This part of attendance is for group admins only~',
      started: 'Attendance started by @{digits}~ Please type .absen check to record your presence!',
      already: 'Attendance is already running, started by {by}. Just type .absen check~',
      noSession: 'No attendance session is running. An admin can start with .absen start~',
      checked: 'Got it, @{digits} is marked present. Total present now {count} people~',
      checkedAgain: '@{digits} was already marked present~',
      closed: 'Attendance closed. Present {count} people:\n{list}\nThanks everyone~ {mood}',
      closedEmpty: 'Attendance closed. Nobody checked in yet. {mood}',
      line: '{index}. @{digits} ({name})',
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
    const list = entries.map(([digits, name], i) => ctx.t('absen.line', { index: i + 1, digits, name })).join('\n')
    const mentions = entries.map(([digits]) => `${digits}@s.whatsapp.net`)
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('absen.closed', { count: entries.length, list, mood: ctx.say('senang') }),
      mentions,
    }, { quoted: ctx.raw })
    return
  }

  return ctx.reply(ctx.t('absen.usage'))
}
