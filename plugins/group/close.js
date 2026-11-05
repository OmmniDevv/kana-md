export const config = {
  name: 'close',
  alias: [],
  category: 'group',
  description: { id: 'Menutup grup: hanya admin yang bisa mengirim pesan (mode pengumuman)', en: 'Close the group: only admins can send messages (announcement mode)' },
  usage: '.close',
  example: '.close',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    close: {
      done: '╭─❏ 🔇 「 *GRUP DITUTUP* 」\n┊ Siap~ grup ditutup, cuma admin yang bisa kirim pesan sekarang~\n┊ Buka lagi dengan *.open* yaa~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *GAGAL MENUTUP GRUP* 」\n┊ {error}\n┊ Pastikan KANA admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    close: {
      done: '╭─❏ 🔇 「 *GROUP CLOSED* 」\n┊ Got it~ the group is closed, only admins can send messages now~\n┊ Open it again with *.open*~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *FAILED TO CLOSE GROUP* 」\n┊ {error}\n┊ Make sure KANA is a group admin~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.close', expect: /GRUP DITUTUP|GROUP CLOSED/ }

export async function handler(ctx) {
  try {
    await ctx.sock.groupSettingUpdate(ctx.chat, 'announcement')
    return ctx.reply(ctx.t('close.done', { mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('close.fail', { error: err.message }))
  }
}
