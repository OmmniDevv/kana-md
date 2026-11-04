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
  id: { tagall: { defaultText: 'Halo halo semuanya, KANA panggil yaa~', header: '{text}\n\nDaftar member ({count}):\n{list}', fail: 'Gagal ambil daftar member grup: {error}' } },
  en: { tagall: { defaultText: 'Hello everyone, KANA is calling you~', header: '{text}\n\nMember list ({count}):\n{list}', fail: 'Failed to get group members: {error}' } },
}

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch (err) { return ctx.reply(ctx.t('tagall.fail', { error: err.message })) }
  }
  const participants = meta?.participants ?? []
  if (!participants.length) return ctx.reply(ctx.t('tagall.fail', { error: 'empty' }))
  const mentions = participants.map((p) => p.id).filter(Boolean)
  const list = participants.map((p, i) => `${i + 1}. @${digitsOf(p.id)}`).join('\n')
  const text = ctx.text || ctx.t('tagall.defaultText')
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('tagall.header', { text, count: participants.length, list }),
    mentions,
  }, { quoted: ctx.raw })
}
