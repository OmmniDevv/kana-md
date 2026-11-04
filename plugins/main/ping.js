export const config = {
  name: 'ping',
  alias: ['p'],
  category: 'main',
  description: { id: 'Cek bot hidup dan latensinya', en: 'Check that the bot is alive and its latency' },
  usage: '.ping',
  example: '.ping',
  cooldown: 3,
}

export const i18n = {
  id: { ping: { reply: 'Pong~ KANA hidup kok! Latensi {ms} ms. {mood}' } },
  en: { ping: { reply: 'Pong~ KANA is alive! Latency {ms} ms. {mood}' } },
}

export async function handler(ctx) {
  const startedAt = ctx.raw?.messageTimestamp ? Number(ctx.raw.messageTimestamp) * 1000 : Date.now()
  const ms = Math.max(0, Date.now() - startedAt)
  await ctx.reply(ctx.t('ping.reply', { ms, mood: ctx.say('senang') }))
}
