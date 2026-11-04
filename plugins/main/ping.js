import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ping',
  alias: ['p'],
  category: 'main',
  description: { id: 'Cek bot hidup dan latensinya', en: 'Check that the bot is alive and its latency' },
  usage: '.ping',
  example: '.ping',
  cooldown: 3,
}

export const i18n = {
  id: {
    ping: {
      reply: 'Pong~ KANA hidup kok! Latensi {ms} ms. {mood}',
      btnMenu: 'Menu utama',
      btnHelp: 'Bantuan',
      btnProfile: 'Profil saya',
      followUp: 'Lanjutan: .menu • .help • .profil',
    },
  },
  en: {
    ping: {
      reply: 'Pong~ KANA is alive! Latency {ms} ms. {mood}',
      btnMenu: 'Main menu',
      btnHelp: 'Help',
      btnProfile: 'My profile',
      followUp: 'Next: .menu • .help • .profil',
    },
  },
}

export async function handler(ctx) {
  const startedAt = ctx.raw?.messageTimestamp ? Number(ctx.raw.messageTimestamp) * 1000 : Date.now()
  const ms = Math.max(0, Date.now() - startedAt)
  const body = [ctx.t('ping.reply', { ms, mood: ctx.say('senang') }), ctx.t('ping.followUp')].join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('ping.btnMenu'), id: '.menu' },
      { text: ctx.t('ping.btnHelp'), id: '.help' },
      { text: ctx.t('ping.btnProfile'), id: '.profil' },
    ],
    textFallback: body,
  })
}
