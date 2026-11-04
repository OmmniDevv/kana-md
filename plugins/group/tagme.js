import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'tagme',
  alias: [],
  category: 'group',
  description: { id: 'Minta KANA men-tag kamu balik di grup', en: 'Ask KANA to tag you back in the group' },
  usage: '.tagme',
  example: '.tagme',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: { tagme: { body: '╭─❏ 👋 「 *TAG BALIK* 」\n┊ Halo *@{digits}*, kamu di-tag balik sesuai permintaan~\n╰━━━━━━━ {mood}' } },
  en: { tagme: { body: '╭─❏ 👋 「 *TAGGED BACK* 」\n┊ Hello *@{digits}*, tagged back as requested~\n╰━━━━━━━ {mood}' } },
}

export const test = { input: '.tagme', expect: /tag/i }

export async function handler(ctx) {
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('tagme.body', { digits: digitsOf(ctx.sender), mood: ctx.say('senang') }),
    mentions: [ctx.sender],
  }, { quoted: ctx.raw })
}
