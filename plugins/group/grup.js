import { getGroupSettings } from '../../src/services/group-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'grup',
  alias: ['group', 'infogrup'],
  category: 'group',
  description: { id: 'Buka, tutup, atau lihat info grup', en: 'Open, close, or show group info' },
  usage: '.grup <open|close|info>',
  example: '.grup info',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    grup: {
      usage: 'Pakai: .grup open, .grup close, atau .grup info yaa~',
      opened: 'Siap~ grup dibuka, semua member bisa kirim pesan lagi. {mood}',
      closed: 'Siap~ grup ditutup, cuma admin yang bisa kirim pesan yaa. {mood}',
      info: 'Info grup {name}\nMember: {count} orang\nStatus ngobrol: {state}\nJadwal otomatis: {schedule}\nWelcome: {welcome} | Antilink: {antilink}\n{mood}',
      stateOpen: 'terbuka (semua bisa kirim)', stateClosed: 'hanya admin', stateUnknown: 'tidak diketahui',
      scheduleOff: 'mati', scheduleOn: 'buka {open}, tutup {close}',
      on: 'AKTIF', off: 'mati',
      fail: 'Gagal ubah pengaturan grup: {error}',
      footer: 'Pengaturan grup KANA', scheduleBtn: 'Atur jadwal', protectBtn: 'Proteksi',
    },
  },
  en: {
    grup: {
      usage: 'Use: .grup open, .grup close, or .grup info~',
      opened: 'Got it~ the group is open, all members can send messages again. {mood}',
      closed: 'Got it~ the group is closed, only admins can send messages. {mood}',
      info: 'Group info {name}\nMembers: {count}\nChat status: {state}\nAuto schedule: {schedule}\nWelcome: {welcome} | Antilink: {antilink}\n{mood}',
      stateOpen: 'open (everyone can send)', stateClosed: 'admins only', stateUnknown: 'unknown',
      scheduleOff: 'off', scheduleOn: 'open {open}, close {close}',
      on: 'ON', off: 'off',
      fail: 'Failed to change group setting: {error}',
      footer: 'KANA group settings', scheduleBtn: 'Set schedule', protectBtn: 'Protection',
    },
  },
}

export const test = { input: '.grup info', expect: /grup|group/i }

export async function handler(ctx) {
  const action = (ctx.args[0] || 'info').toLowerCase()
  if (action === 'open' || action === 'close') {
    try {
      await ctx.sock.groupSettingUpdate(ctx.chat, action === 'open' ? 'not_announcement' : 'announcement')
      return ctx.reply(ctx.t(action === 'open' ? 'grup.opened' : 'grup.closed', { mood: ctx.say('senang') }))
    } catch (err) {
      return ctx.reply(ctx.t('grup.fail', { error: err.message }))
    }
  }
  if (action !== 'info') return ctx.reply(ctx.t('grup.usage'))
  let meta = ctx.groupMetadata
  if (!meta) { try { meta = await ctx.getGroupMetadata() } catch {} }
  const s = await getGroupSettings(ctx.storage, ctx.chat)
  const state = meta?.announce === true ? ctx.t('grup.stateClosed') : meta?.announce === false ? ctx.t('grup.stateOpen') : ctx.t('grup.stateUnknown')
  const schedule = s.openClose?.open ? ctx.t('grup.scheduleOn', { open: s.openClose.open, close: s.openClose.close }) : ctx.t('grup.scheduleOff')
  const body = ctx.t('grup.info', {
    name: meta?.subject || ctx.chat,
    count: meta?.participants?.length ?? 0,
    state, schedule,
    welcome: ctx.t(s.welcome ? 'grup.on' : 'grup.off'),
    antilink: ctx.t(s.antilink ? 'grup.on' : 'grup.off'),
    mood: ctx.say('senang'),
  })
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('grup.footer'),
    replies: [
      { text: ctx.t('grup.scheduleBtn'), id: '.jadwalgrup' },
      { text: ctx.t('grup.protectBtn'), id: '.protect' },
      { text: 'Menu grup', id: '.menu group' },
    ],
    textFallback: body,
  })
}
