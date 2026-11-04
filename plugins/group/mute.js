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
      done: '🔇 Grup ditutup. Cuma admin yang bisa kirim pesan sekarang. Buka lagi dengan .unmute yaa~ {mood}',
      fail: 'Gagal menutup grup: {error}. Pastikan KANA admin grup yaa~',
    },
  },
  en: {
    mute: {
      done: '🔇 Group muted. Only admins can send messages now. Open it again with .unmute~ {mood}',
      fail: 'Failed to mute the group: {error}. Make sure KANA is a group admin~',
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
