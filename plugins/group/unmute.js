export const config = {
  name: 'unmute',
  alias: ['bukagrup'],
  category: 'group',
  description: { id: 'Buka grup: semua member bisa mengirim pesan lagi', en: 'Unmute the group: all members can send messages again' },
  usage: '.unmute',
  example: '.unmute',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    unmute: {
      done: '🔊 Grup dibuka. Semua member bisa kirim pesan lagi. Gas ngobrol yang sopan yaa~ {mood}',
      fail: 'Gagal membuka grup: {error}. Pastikan KANA admin grup yaa~',
    },
  },
  en: {
    unmute: {
      done: '🔊 Group unmuted. All members can send messages again. Keep the chat kind~ {mood}',
      fail: 'Failed to unmute the group: {error}. Make sure KANA is a group admin~',
    },
  },
}

export const test = { input: '.unmute', expect: /grup|group/i }

export async function handler(ctx) {
  try {
    await ctx.sock.groupSettingUpdate(ctx.chat, 'not_announcement')
    return ctx.reply(ctx.t('unmute.done', { mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('unmute.fail', { error: err.message }))
  }
}
