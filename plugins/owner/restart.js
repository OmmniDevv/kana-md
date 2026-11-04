export const config = {
  name: 'restart',
  alias: ['restartbot'],
  category: 'owner',
  description: { id: 'Restart proses bot; systemd akan menghidupkannya lagi otomatis (owner)', en: 'Restart the bot process; systemd brings it back automatically (owner)' },
  usage: '.restart',
  example: '.restart',
  cooldown: 30,
  isOwner: true,
}

export const i18n = {
  id: { restart: { body: 'Siap, Master~ KANA restart dulu yaa, balik lagi dalam beberapa detik. {mood}' } },
  en: { restart: { body: 'Got it, Master~ KANA is restarting, back in a few seconds. {mood}' } },
}

export const test = { input: '.restart', expect: /restart/i }

export async function handler(ctx) {
  await ctx.reply(ctx.t('restart.body', { mood: ctx.say('pamit') }))
  // Beri jeda supaya pesan terkirim sebelum proses turun; supervisor
  // (systemd Restart=always) menghidupkan bot lagi otomatis.
  setTimeout(() => process.exit(0), 1500)
}
