export const config = {
  name: 'hidetag',
  alias: ['ht', 'announce', 'hiddentag'],
  category: 'group',
  description: { id: 'Tag semua member grup tanpa daftar nama', en: 'Tag all group members without a name list' },
  usage: '.hidetag [teks]',
  example: '.hidetag pengumuman penting',
  cooldown: 10,
  isGroup: true,
  isAdmin: true,
  needsAdminInfo: true,
}

export const i18n = {
  id: { hidetag: { defaultText: '╭─❏ 📣 「 *PENGUMUMAN GRUP* 」\n┊ Halo halo semuanya, ada pengumuman dari KANA yaa~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL HIDETAG* 」\n┊ Gagal ambil daftar member grup: {error}\n╰━━━━━━━' } },
  en: { hidetag: { defaultText: '╭─❏ 📣 「 *GROUP ANNOUNCEMENT* 」\n┊ Hello everyone, an announcement from KANA~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *HIDETAG FAILED* 」\n┊ Failed to get group members: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.hidetag', expect: /grup|group/i }

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch (err) { return ctx.reply(ctx.t('hidetag.fail', { error: err.message })) }
  }
  const participants = meta?.participants ?? []
  if (!participants.length) return ctx.reply(ctx.t('hidetag.fail', { error: 'empty' }))
  const mentions = participants.map((p) => p.id).filter(Boolean)
  await ctx.sock.sendMessage(ctx.chat, { text: ctx.text || ctx.t('hidetag.defaultText'), mentions }, { quoted: ctx.raw })
}
