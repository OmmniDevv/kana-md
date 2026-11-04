export const config = {
  name: 'setppgrup',
  alias: [],
  category: 'group',
  description: { id: 'Ganti foto profil grup dari gambar yang dibalas', en: 'Change group picture from a replied image' },
  usage: '.setppgrup (balas gambar)',
  example: '.setppgrup',
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: { setppgrup: { usage: 'Balas sebuah gambar dengan .setppgrup yaa, KANA nggak nemu gambarnya nih~', ok: 'Yayyy, foto profil grup udah diganti. {mood}', fail: 'Gagal ganti foto profil grup: {error}. Pastikan gambarnya jpeg atau png dan ukurannya wajar yaa.' } },
  en: { setppgrup: { usage: 'Reply to an image with .setppgrup, I could not find the image~', ok: 'Yayyy, group picture has been changed. {mood}', fail: 'Failed to change group picture: {error}. Make sure the image is jpeg or png and reasonably sized.' } },
}

export async function handler(ctx) {
  let buffer
  try {
    buffer = await ctx.downloadQuoted()
  } catch {
    return ctx.reply(ctx.t('setppgrup.usage'))
  }
  if (!buffer?.length) return ctx.reply(ctx.t('setppgrup.usage'))
  try {
    await ctx.sock.updateProfilePicture(ctx.chat, buffer)
    await ctx.reply(ctx.t('setppgrup.ok', { mood: ctx.say('senang') }))
  } catch (err) {
    await ctx.reply(ctx.t('setppgrup.fail', { error: err.message }))
  }
}
