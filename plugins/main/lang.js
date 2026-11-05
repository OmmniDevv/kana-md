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
      current: '╭─❏ 🌐 「 *BAHASA* 」\n┊ ʙᴀʜᴀꜱᴀ ᴋᴀᴍᴜ ꜱᴇᴋᴀʀᴀɴɢ: *{lang}*\n┊ Ketik *.lang id* atau *.lang en* buat ganti ya~\n╰━━━━━━━',
      changed: '╭─❏ 🌐 「 *BAHASA DIGANTI* 」\n┊ Siap~ bahasa diganti ke *{lang}*.\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ ⚠️ 「 *BAHASA TIDAK ADA* 」\n┊ Bahasa *"{lang}"* nggak ada. ᴘɪʟɪʜᴀɴ: *id* atau *en*~\n╰━━━━━━━',
    },
  },
  en: {
    lang: {
      current: '╭─❏ 🌐 「 *LANGUAGE* 」\n┊ ʏᴏᴜʀ ᴄᴜʀʀᴇɴᴛ ʟᴀɴɢᴜᴀɢᴇ: *{lang}*\n┊ Type *.lang id* or *.lang en* to change it~\n╰━━━━━━━',
      changed: '╭─❏ 🌐 「 *LANGUAGE CHANGED* 」\n┊ Got it~ language changed to *{lang}*.\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ ⚠️ 「 *LANGUAGE NOT FOUND* 」\n┊ Language *"{lang}"* does not exist. ᴏᴘᴛɪᴏɴꜱ: *id* or *en*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.lang id', expect: /BAHASA DIGANTI|LANGUAGE CHANGED/ }

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
  return ctx.reply(ctx.t('lang.changed', { lang: target, mood: ctx.say('senang') }))
}
