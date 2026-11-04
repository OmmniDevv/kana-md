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
  id: { setppgrup: { usage: '╭─❏ 🖼️ 「 *BALAS GAMBARNYA DULU* 」\n┊ Balas sebuah gambar dengan *.setppgrup* yaa~\n┊ KANA nggak nemu gambarnya nih~\n╰━━━━━━━', ok: '╭─❏ 🎉 「 *FOTO GRUP DIGANTI* 」\n┊ Yayyy, foto profil grup udah diganti~\n╰━━━━━━━ {mood}', fail: '╭─❏ ⚠️ 「 *GAGAL GANTI FOTO* 」\n┊ Gagal ganti foto profil grup: {error}\n┊ Pastikan gambarnya jpeg atau png dan ukurannya wajar yaa~\n╰━━━━━━━' } },
  en: { setppgrup: { usage: '╭─❏ 🖼️ 「 *REPLY TO AN IMAGE FIRST* 」\n┊ Reply to an image with *.setppgrup*~\n┊ I could not find the image~\n╰━━━━━━━', ok: '╭─❏ 🎉 「 *GROUP PICTURE CHANGED* 」\n┊ Yayyy, group picture has been changed~\n╰━━━━━━━ {mood}', fail: '╭─❏ ⚠️ 「 *FAILED TO CHANGE PICTURE* 」\n┊ Failed to change group picture: {error}\n┊ Make sure the image is jpeg or png and reasonably sized~\n╰━━━━━━━' } },
}

export const test = { input: '.setppgrup', expect: /grup|group/i }

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
