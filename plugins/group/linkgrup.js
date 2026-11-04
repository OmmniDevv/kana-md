export const config = {
  name: 'linkgrup',
  alias: ['linkgroup', 'grouplink'],
  category: 'group',
  description: { id: 'Ambil link undangan grup', en: 'Get the group invite link' },
  usage: '.linkgrup',
  example: '.linkgrup',
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: { linkgrup: { ok: 'Ini link grupnya yaa: {link}\nBagikan cuma ke orang yang dipercaya~', fail: 'Gagal ambil link grup: {error}' } },
  en: { linkgrup: { ok: 'Here is the group link: {link}\nShare it only with trusted people~', fail: 'Failed to get group link: {error}' } },
}

export const test = { input: '.linkgrup', expect: /grup|group/i }

export async function handler(ctx) {
  try {
    const code = await ctx.sock.groupInviteCode(ctx.chat)
    await ctx.reply(ctx.t('linkgrup.ok', { link: `https://chat.whatsapp.com/${code}` }))
  } catch (err) {
    await ctx.reply(ctx.t('linkgrup.fail', { error: err.message }))
  }
}
