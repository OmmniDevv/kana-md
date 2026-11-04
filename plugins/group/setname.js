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
  id: { setname: { usage: '╭─❏ ✏️ 「 *NAMA BARUNYA MANA?* 」\n┊ Tulis nama grup barunya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.setname Grup Belajar*\n╰━━━━━━━', ok: '╭─❏ ✅ 「 *NAMA GRUP DIGANTI* 」\n┊ Siap~ nama grup diganti jadi *{name}*~\n╰━━━━━━━ {mood}', fail: '╭─❏ ⚠️ 「 *GAGAL GANTI NAMA* 」\n┊ Gagal ganti nama grup: {error}\n╰━━━━━━━' } },
  en: { setname: { usage: '╭─❏ ✏️ 「 *WHERE IS THE NEW NAME?* 」\n┊ Write the new group name~\n┊ ᴇxᴀᴍᴘʟᴇ: *.setname Study Group*\n╰━━━━━━━', ok: '╭─❏ ✅ 「 *GROUP NAME CHANGED* 」\n┊ Got it~ group name changed to *{name}*~\n╰━━━━━━━ {mood}', fail: '╭─❏ ⚠️ 「 *FAILED TO CHANGE NAME* 」\n┊ Failed to change group name: {error}\n╰━━━━━━━' } },
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
