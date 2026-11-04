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
      done: '╭─❏ 🔊 「 *GRUP DIBUKA* 」\n┊ Semua member bisa kirim pesan lagi~\n┊ Gas ngobrol yang sopan yaa~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *GAGAL MEMBUKA GRUP* 」\n┊ {error}\n┊ Pastikan KANA admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    unmute: {
      done: '╭─❏ 🔊 「 *GROUP UNMUTED* 」\n┊ All members can send messages again~\n┊ Keep the chat kind yaa~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *FAILED TO UNMUTE GROUP* 」\n┊ {error}\n┊ Make sure KANA is a group admin~\n╰━━━━━━━',
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
