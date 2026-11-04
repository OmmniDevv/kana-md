import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'mode',
  alias: [],
  category: 'owner',
  description: { id: 'Lihat atau ganti mode bot (public atau self)', en: 'See or change the bot mode (public or self)' },
  usage: '.mode [public|self]',
  example: '.mode self',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    mode: {
      current: 'Mode bot sekarang: {mode}. Ketik .mode public atau .mode self buat ganti yaa, Master~',
      changed: 'Siap, Master~ mode bot diganti ke {mode}. {mood}',
      invalid: 'Mode "{mode}" nggak dikenal. Pilihan: public atau self yaa~',
      btnPublic: 'Mode Public',
      btnSelf: 'Mode Self',
    },
  },
  en: {
    mode: {
      current: 'Current bot mode: {mode}. Type .mode public or .mode self to change it, Master~',
      changed: 'Got it, Master~ bot mode changed to {mode}. {mood}',
      invalid: 'Mode "{mode}" is not recognized. Options: public or self~',
      btnPublic: 'Public Mode',
      btnSelf: 'Self Mode',
    },
  },
}

export async function handler(ctx) {
  const arg = (ctx.args[0] || '').toLowerCase()
  const saved = await ctx.storage.get('settings', 'bot')
  const current = saved?.mode || 'public'
  if (!arg) {
    const body = ctx.t('mode.current', { mode: current })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [
        { text: ctx.t('mode.btnPublic'), id: '.mode public' },
        { text: ctx.t('mode.btnSelf'), id: '.mode self' },
      ],
      textFallback: body,
    })
  }
  if (arg !== 'public' && arg !== 'self') {
    return ctx.reply(ctx.t('mode.invalid', { mode: arg }))
  }
  await ctx.storage.set('settings', 'bot', { mode: arg })
  const body = ctx.t('mode.changed', { mode: arg, mood: ctx.say('sukses') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('mode.btnPublic'), id: '.mode public' },
      { text: ctx.t('mode.btnSelf'), id: '.mode self' },
    ],
    textFallback: body,
  })
}
