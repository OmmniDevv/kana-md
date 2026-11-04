import { sendButtons } from '../../src/ui/buttons.js'
import { SUPPORTED_LANGS } from '../../src/i18n/index.js'

export const config = {
  name: 'lang',
  alias: ['bahasa', 'language'],
  category: 'main',
  description: { id: 'Ganti bahasa bot (id atau en)', en: 'Change the bot language (id or en)' },
  usage: '.lang <id|en>',
  example: '.lang en',
  cooldown: 3,
}

export const i18n = {
  id: {
    lang: {
      current: 'Bahasa kamu sekarang: {lang}. Ketik .lang id atau .lang en buat ganti ya~',
      changed: 'Siap~ bahasa diganti ke {lang}. {mood}',
      invalid: 'Bahasa "{lang}" nggak ada. Pilihan: id atau en~',
      btnMenu: 'Menu utama',
      btnHelp: 'Bantuan',
      followUp: 'Lanjutan: .menu • .help',
    },
  },
  en: {
    lang: {
      current: 'Your current language: {lang}. Type .lang id or .lang en to change it~',
      changed: 'Got it~ language changed to {lang}. {mood}',
      invalid: 'Language "{lang}" does not exist. Options: id or en~',
      btnMenu: 'Main menu',
      btnHelp: 'Help',
      followUp: 'Next: .menu • .help',
    },
  },
}

export async function handler(ctx) {
  const target = ctx.args[0]?.toLowerCase()
  if (!target) {
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('lang.current', { lang: ctx.lang }),
      footer: ctx.t('menu.footer'),
      replies: [
        { text: 'Indonesia', id: 'lang id' },
        { text: 'English', id: 'lang en' },
      ],
      textFallback: ctx.t('lang.current', { lang: ctx.lang }),
    })
    return
  }
  if (!SUPPORTED_LANGS.includes(target)) {
    await ctx.reply(ctx.t('lang.invalid', { lang: target }))
    return
  }
  const userKey = `${ctx.sender.replace(/\D/g, '')}:lang`
  await ctx.storage.set('users', userKey, target)
  const body = [ctx.t('lang.changed', { lang: target, mood: ctx.say('senang') }), ctx.t('lang.followUp')].join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('lang.btnMenu'), id: '.menu' },
      { text: ctx.t('lang.btnHelp'), id: '.help' },
    ],
    textFallback: body,
  })
}
