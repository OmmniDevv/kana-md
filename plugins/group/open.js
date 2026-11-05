export const config = {
  name: 'open',
  alias: [],
  category: 'group',
  description: { id: 'Membuka grup: semua member bisa mengirim pesan lagi', en: 'Open the group: all members can send messages again' },
  usage: '.open',
  example: '.open',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    open: {
      done: '╭─❏ 🔊 「 *GRUP DIBUKA* 」\n┊ Siap~ grup dibuka, semua member bisa kirim pesan lagi~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *GAGAL MEMBUKA GRUP* 」\n┊ {error}\n┊ Pastikan KANA admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    open: {
      done: '╭─❏ 🔊 「 *GROUP OPENED* 」\n┊ Got it~ the group is open, all members can send messages again~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *FAILED TO OPEN GROUP* 」\n┊ {error}\n┊ Make sure KANA is a group admin~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.open', expect: /GRUP DIBUKA|GROUP OPENED/ }

export async function handler(ctx) {
  try {
    await ctx.sock.groupSettingUpdate(ctx.chat, 'not_announcement')
    return ctx.reply(ctx.t('open.done', { mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('open.fail', { error: err.message }))
  }
}
