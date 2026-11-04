import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'tagall',
  alias: [],
  category: 'group',
  description: { id: 'Tag semua member grup dengan daftar nama', en: 'Tag all group members with a name list' },
  usage: '.tagall [teks]',
  example: '.tagall rapat jam 7 ya',
  cooldown: 10,
  isGroup: true,
}

export const i18n = {
  id: { tagall: { defaultText: 'Halo halo semuanya, KANA panggil yaa~', header: '╭─❏ 📣 「 *PANGGILAN GRUP* 」\n┊ {text}\n┊ ᴅᴀꜰᴛᴀʀ ᴍᴇᴍʙᴇʀ ({count}):\n┊ {list}\n╰━━━━━━━', line: '{index}. *@{digits}*', fail: '╭─❏ ⚠️ 「 *GAGAL TAGALL* 」\n┊ Gagal ambil daftar member grup: {error}\n╰━━━━━━━' } },
  en: { tagall: { defaultText: 'Hello everyone, KANA is calling you~', header: '╭─❏ 📣 「 *GROUP CALL* 」\n┊ {text}\n┊ ᴍᴇᴍʙᴇʀ ʟɪꜱᴛ ({count}):\n┊ {list}\n╰━━━━━━━', line: '{index}. *@{digits}*', fail: '╭─❏ ⚠️ 「 *TAGALL FAILED* 」\n┊ Failed to get group members: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.tagall', expect: /grup|group/i }

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch (err) { return ctx.reply(ctx.t('tagall.fail', { error: err.message })) }
  }
  const participants = meta?.participants ?? []
  if (!participants.length) return ctx.reply(ctx.t('tagall.fail', { error: 'empty' }))
  const mentions = participants.map((p) => p.id).filter(Boolean)
  const list = participants.map((p, i) => ctx.t('tagall.line', { index: i + 1, digits: digitsOf(p.id) })).join('\n┊ ')
  const text = ctx.text || ctx.t('tagall.defaultText')
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('tagall.header', { text, count: participants.length, list }),
    mentions,
  }, { quoted: ctx.raw })
}
