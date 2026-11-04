import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, limitState, DEFAULT_DAILY_LIMIT } from '../../src/services/user-service.js'

export const config = {
  name: 'limit',
  alias: [],
  category: 'user',
  description: { id: 'Cek sisa limit harian kamu', en: 'Check your remaining daily limit' },
  usage: '.limit',
  example: '.limit',
  cooldown: 3,
}

export const i18n = {
  id: {
    limit: {
      info: '╭─❏ 🎫 「 *LIMIT HARIAN* 」\n┊ ꜱɪꜱᴀ ʟɪᴍɪᴛ: *{left} dari {max}*\n┊ ʀᴇꜱᴇᴛ: *besok pagi*\n╰━━━━━━━\nPakai dengan bijak yaa~ {mood}',
      btnProfile: 'Profil Aku',
    },
  },
  en: {
    limit: {
      info: '╭─❏ 🎫 「 *DAILY LIMIT* 」\n┊ ʟɪᴍɪᴛ ʟᴇꜰᴛ: *{left} of {max}*\n┊ ʀᴇꜱᴇᴛ: *tomorrow morning*\n╰━━━━━━━\nUse it wisely~ {mood}',
      btnProfile: 'My Profile',
    },
  },
}

export const test = { input: '.limit', expect: /limit/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const state = limitState(profile)
  const body = ctx.t('limit.info', { left: state.left, max: DEFAULT_DAILY_LIMIT, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('limit.btnProfile'), id: '.profil' }],
    textFallback: body,
  })
}
