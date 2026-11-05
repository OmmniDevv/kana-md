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
  id: { setdesc: { usage: '╭─❏ ✏️ 「 *DESKRIPSI BARUNYA MANA?* 」\n┊ Tulis deskripsi grup barunya yaa~\n╰━━━━━━━', ok: '╭─❏ ✅ 「 *DESKRIPSI DIGANTI* 」\n┊ Siap~ deskripsi grup udah diganti~\n╰━━━━━━━ {mood}', fail: '╭─❏ ⚠️ 「 *GAGAL GANTI DESKRIPSI* 」\n┊ Gagal ganti deskripsi grup: {error}\n╰━━━━━━━' } },
  en: { setdesc: { usage: '╭─❏ ✏️ 「 *WHERE IS THE NEW DESCRIPTION?* 」\n┊ Write the new group description~\n╰━━━━━━━', ok: '╭─❏ ✅ 「 *DESCRIPTION CHANGED* 」\n┊ Got it~ group description has been changed~\n╰━━━━━━━ {mood}', fail: '╭─❏ ⚠️ 「 *FAILED TO CHANGE DESCRIPTION* 」\n┊ Failed to change group description: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.setdesc Grup seru untuk belajar dan berbagi', expect: /grup|group/i }

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
