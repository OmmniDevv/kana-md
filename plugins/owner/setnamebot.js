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
      hint: 'Tulis nama barunya yaa, Master. Contoh: .setnamebot KANA',
      done: 'Siap, Master~ nama profil KANA sekarang *{name}*. {mood}',
      fail: 'Gagal ganti nama, Master: {error}',
    },
  },
  en: {
    setnamebot: {
      hint: 'Write the new name, Master. Example: .setnamebot KANA',
      done: 'Done, Master~ KANA profile name is now *{name}*. {mood}',
      fail: 'Failed to change the name, Master: {error}',
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
