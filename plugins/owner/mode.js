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
      current: '╭─❏ ⚙️ 「 *MODE BOT* 」\n┊ ᴍᴏᴅᴇ ꜱᴇᴋᴀʀᴀɴɢ: *{mode}*\n┊ Ketik *.mode public* atau *.mode self* buat ganti yaa, Master~\n╰━━━━━━━',
      changed: '╭─❏ ⚙️ 「 *MODE DIGANTI* 」\n┊ ᴍᴏᴅᴇ ꜱᴇᴋᴀʀᴀɴɢ: *{mode}*\n┊ Siap, Master~ mode bot sudah diganti. {mood}\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *MODE TIDAK DIKENAL* 」\n┊ Mode *{mode}* nggak dikenal, Master.\n┊ ᴘɪʟɪʜᴀɴ: *public* atau *self* yaa~\n╰━━━━━━━',
      btnPublic: 'Mode Public',
      btnSelf: 'Mode Self',
    },
  },
  en: {
    mode: {
      current: '╭─❏ ⚙️ 「 *BOT MODE* 」\n┊ ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *{mode}*\n┊ Type *.mode public* or *.mode self* to change it, Master~\n╰━━━━━━━',
      changed: '╭─❏ ⚙️ 「 *MODE CHANGED* 」\n┊ ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *{mode}*\n┊ Got it, Master~ bot mode is changed. {mood}\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *UNKNOWN MODE* 」\n┊ Mode *{mode}* is not recognized, Master.\n┊ ᴏᴘᴛɪᴏɴꜱ: *public* or *self*~\n╰━━━━━━━',
      btnPublic: 'Public Mode',
      btnSelf: 'Self Mode',
    },
  },
}

export const test = { input: '.mode', expect: /mode/i }

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
