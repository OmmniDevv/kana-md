// Beri reaksi emoji ke pesan yang dikutip (reply-first: balas pesan
// target, lalu tulis .react <emoji>).
export const config = {
  name: 'react',
  alias: ['reaksi'],
  category: 'fun',
  description: { id: 'Beri reaksi emoji ke pesan yang kamu balas', en: 'React with an emoji to the message you reply to' },
  usage: '.react <emoji> (balas pesan)',
  example: '.react ❤️',
  cooldown: 3,
}

export const i18n = {
  id: { react: { hint: '╭─❏ 🎭 「 *REAKSI* 」\n┊ Balas pesan yang mau direaksikan lalu tulis .react diikuti emojinya yaa~ Contoh: balas pesan lalu .react ❤️\n╰━━━━━━━', done: '' } },
  en: { react: { hint: '╭─❏ 🎭 「 *REACTION* 」\n┊ Reply to the message then write .react with an emoji please~ Example: reply to a message then .react ❤️\n╰━━━━━━━', done: '' } },
}

export const test = { input: '.react', expect: /balas|reply/i }

const EMOJI_RE = /\p{Extended_Pictographic}/u

export async function handler(ctx) {
  const emoji = (ctx.text || '').trim().split(/\s+/)[0]
  const quoted = ctx.quoted
  if (!quoted?.stanzaId || !emoji || !EMOJI_RE.test(emoji)) {
    return ctx.reply(ctx.t('react.hint'))
  }
  const key = {
    remoteJid: ctx.chat,
    id: quoted.stanzaId,
    fromMe: false,
    ...(quoted.sender ? { participant: quoted.sender } : {}),
  }
  await ctx.sock.sendMessage(ctx.chat, { react: { text: emoji, key } })
  return undefined
}
