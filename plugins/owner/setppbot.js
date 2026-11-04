export const config = {
  name: 'setppbot',
  alias: ['gantipp', 'setpp'],
  category: 'owner',
  description: { id: 'Ganti foto profil bot dari gambar yang dibalas (owner)', en: 'Change the bot profile picture from the replied image (owner)' },
  usage: 'Balas gambar dengan .setppbot',
  example: '.setppbot',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    setppbot: {
      hint: '╭─❏ 🖼️ 「 *GANTI FOTO PROFIL* 」\n┊ Balas (reply) gambar yang mau jadi foto profil KANA dengan *.setppbot* yaa, Master~\n╰━━━━━━━',
      done: '╭─❏ 🖼️ 「 *FOTO PROFIL DIGANTI* 」\n┊ Siap, Master~ foto profil KANA sudah diganti. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL GANTI FOTO PROFIL* 」\n┊ Mouu, gagal ganti foto profil, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    setppbot: {
      hint: '╭─❏ 🖼️ 「 *CHANGE PROFILE PICTURE* 」\n┊ Reply to the image that should become KANA profile picture with *.setppbot*, Master~\n╰━━━━━━━',
      done: '╭─❏ 🖼️ 「 *PROFILE PICTURE CHANGED* 」\n┊ Done, Master~ KANA profile picture is changed. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *PROFILE PICTURE CHANGE FAILED* 」\n┊ Mouu, failed to change the profile picture, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.setppbot', expect: /reply|balas/i }

export async function handler(ctx) {
  if (!ctx.quoted) return ctx.reply(ctx.t('setppbot.hint'))
  let buffer
  try {
    buffer = await ctx.downloadQuoted()
  } catch {
    return ctx.reply(ctx.t('setppbot.hint'))
  }
  if (!buffer?.length) return ctx.reply(ctx.t('setppbot.hint'))
  try {
    await ctx.sock.updateProfilePicture(ctx.botJid, buffer)
    return ctx.reply(ctx.t('setppbot.done', { mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('setppbot.fail', { error: err.message }))
  }
}
