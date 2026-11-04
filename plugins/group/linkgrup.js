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
  id: { linkgrup: { ok: '╭─❏ 🔗 「 *LINK GRUP* 」\n┊ {link}\n┊ Bagikan cuma ke orang yang dipercaya yaa~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL AMBIL LINK* 」\n┊ Gagal ambil link grup: {error}\n╰━━━━━━━' } },
  en: { linkgrup: { ok: '╭─❏ 🔗 「 *GROUP LINK* 」\n┊ {link}\n┊ Share it only with trusted people~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *FAILED TO GET LINK* 」\n┊ Failed to get group link: {error}\n╰━━━━━━━' } },
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
