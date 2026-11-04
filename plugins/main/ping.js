export const config = {
  name: 'ping',
  alias: ['p', 'testspeed'],
  category: 'main',
  description: { id: 'Cek bot hidup dan latensinya', en: 'Check that the bot is alive and its latency' },
  usage: '.ping',
  example: '.ping',
  cooldown: 3,
}

export const i18n = {
  id: {
    ping: {
      reply: '╭─❏ 🏓 「 *PONG* 」\n┊ Pong~ KANA hidup kok!\n┊ ʟᴀᴛᴇɴꜱɪ: *{ms} ms*\n╰━━━━━━━ {mood}',
    },
  },
  en: {
    ping: {
      reply: '╭─❏ 🏓 「 *PONG* 」\n┊ Pong~ KANA is alive!\n┊ ʟᴀᴛᴇɴᴄʏ: *{ms} ms*\n╰━━━━━━━ {mood}',
    },
  },
}

export const test = { input: '.ping', expect: /pong/i }

export async function handler(ctx) {
  const startedAt = ctx.raw?.messageTimestamp ? Number(ctx.raw.messageTimestamp) * 1000 : Date.now()
  const ms = Math.max(0, Date.now() - startedAt)
  return ctx.reply(ctx.t('ping.reply', { ms, mood: ctx.say('senang') }))
}
