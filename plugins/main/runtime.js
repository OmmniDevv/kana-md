export const config = {
  name: 'runtime',
  alias: ['uptime', 'rt'],
  category: 'main',
  description: { id: 'Sudah berapa lama bot berjalan sejak terakhir menyala', en: 'How long the bot has been running since it last started' },
  usage: '.runtime',
  example: '.runtime',
  cooldown: 5,
}

export const i18n = {
  id: { runtime: { body: '⏱️ KANA sudah berjalan selama *{duration}* tanpa putus. {mood}' } },
  en: { runtime: { body: '⏱️ KANA has been running for *{duration}* without dropping. {mood}' } },
}

export const test = { input: '.runtime', expect: /berjalan|running/i }

export function formatDuration(ms, lang) {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const units = lang === 'en'
    ? [[d, 'days'], [h, 'hours'], [m, 'minutes'], [sec, 'seconds']]
    : [[d, 'hari'], [h, 'jam'], [m, 'menit'], [sec, 'detik']]
  return units.filter(([v]) => v > 0).map(([v, u]) => `${v} ${u}`).join(' ') || (lang === 'en' ? '0 seconds' : '0 detik')
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('runtime.body', {
    duration: formatDuration(process.uptime() * 1000, ctx.lang),
    mood: ctx.say('senang'),
  }))
}
