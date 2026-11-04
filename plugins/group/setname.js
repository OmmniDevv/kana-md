export const config = {
  name: 'setname',
  alias: [],
  category: 'group',
  description: { id: 'Ganti nama grup', en: 'Change the group name' },
  usage: '.setname <teks>',
  example: '.setname Grup Belajar KANA',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: { setname: { usage: 'Tulis nama barunya yaa, contoh .setname Grup Belajar~', ok: 'Siap~ nama grup diganti jadi "{name}". {mood}', fail: 'Gagal ganti nama grup: {error}' } },
  en: { setname: { usage: 'Write the new name, for example .setname Study Group~', ok: 'Got it~ group name changed to "{name}". {mood}', fail: 'Failed to change group name: {error}' } },
}

export const test = { input: '.setname', expect: /grup|group/i }

export async function handler(ctx) {
  const name = ctx.text.trim()
  if (!name) return ctx.reply(ctx.t('setname.usage'))
  try {
    await ctx.sock.groupUpdateSubject(ctx.chat, name)
    await ctx.reply(ctx.t('setname.ok', { name, mood: ctx.say('senang') }))
  } catch (err) {
    await ctx.reply(ctx.t('setname.fail', { error: err.message }))
  }
}
