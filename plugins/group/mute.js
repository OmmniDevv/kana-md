export const config = {
  name: 'mute',
  alias: ['tutupgrup'],
  category: 'group',
  description: { id: 'Tutup grup: hanya admin yang bisa mengirim pesan', en: 'Mute the group: only admins can send messages' },
  usage: '.mute',
  example: '.mute',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    mute: {
      done: '╭─❏ 🔇 「 *GRUP DITUTUP* 」\n┊ Cuma admin yang bisa kirim pesan sekarang~\n┊ Buka lagi dengan *.unmute* yaa~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *GAGAL MENUTUP GRUP* 」\n┊ {error}\n┊ Pastikan KANA admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    mute: {
      done: '╭─❏ 🔇 「 *GROUP MUTED* 」\n┊ Only admins can send messages now~\n┊ Open it again with *.unmute*~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *FAILED TO MUTE GROUP* 」\n┊ {error}\n┊ Make sure KANA is a group admin~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.mute', expect: /grup|group/i }

export async function handler(ctx) {
  try {
    await ctx.sock.groupSettingUpdate(ctx.chat, 'announcement')
    return ctx.reply(ctx.t('mute.done', { mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('mute.fail', { error: err.message }))
  }
}
