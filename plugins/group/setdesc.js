export const config = {
  name: 'setdesc',
  alias: [],
  category: 'group',
  description: { id: 'Ganti deskripsi grup', en: 'Change the group description' },
  usage: '.setdesc <teks>',
  example: '.setdesc Grup belajar bareng, sopan ya',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: { setdesc: { usage: 'Tulis deskripsi barunya yaa~', ok: 'Siap~ deskripsi grup udah diganti. {mood}', fail: 'Gagal ganti deskripsi grup: {error}' } },
  en: { setdesc: { usage: 'Write the new description~', ok: 'Got it~ group description has been changed. {mood}', fail: 'Failed to change group description: {error}' } },
}

export async function handler(ctx) {
  const desc = ctx.text.trim()
  if (!desc) return ctx.reply(ctx.t('setdesc.usage'))
  try {
    await ctx.sock.groupUpdateDescription(ctx.chat, desc)
    await ctx.reply(ctx.t('setdesc.ok', { mood: ctx.say('senang') }))
  } catch (err) {
    await ctx.reply(ctx.t('setdesc.fail', { error: err.message }))
  }
}
