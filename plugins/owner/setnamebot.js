export const config = {
  name: 'setnamebot',
  alias: ['gantinamabot'],
  category: 'owner',
  description: { id: 'Ganti nama tampilan profil bot (owner)', en: 'Change the bot profile display name (owner)' },
  usage: '.setnamebot <nama baru>',
  example: '.setnamebot KANA',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    setnamebot: {
      hint: '╭─❏ ✏️ 「 *GANTI NAMA BOT* 」\n┊ Tulis nama barunya yaa, Master.\n┊ ᴄᴏɴᴛᴏʜ: *.setnamebot KANA*\n╰━━━━━━━',
      done: '╭─❏ ✏️ 「 *NAMA DIGANTI* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ Siap, Master~ nama profil KANA sudah diganti. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL GANTI NAMA* 」\n┊ Mouu, gagal ganti nama, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    setnamebot: {
      hint: '╭─❏ ✏️ 「 *CHANGE BOT NAME* 」\n┊ Write the new name, Master.\n┊ ᴇxᴀᴍᴘʟᴇ: *.setnamebot KANA*\n╰━━━━━━━',
      done: '╭─❏ ✏️ 「 *NAME CHANGED* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ Done, Master~ KANA profile name is changed. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *NAME CHANGE FAILED* 」\n┊ Mouu, failed to change the name, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.setnamebot', expect: /nama|name/i }

export async function handler(ctx) {
  const name = (ctx.text || '').trim().slice(0, 60)
  if (!name) return ctx.reply(ctx.t('setnamebot.hint'))
  try {
    await ctx.sock.updateProfileName(name)
    return ctx.reply(ctx.t('setnamebot.done', { name, mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('setnamebot.fail', { error: err.message }))
  }
}
