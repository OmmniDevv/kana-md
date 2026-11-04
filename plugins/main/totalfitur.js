export const config = {
  name: 'totalfitur',
  alias: ['totalcmd', 'jumlahfitur'],
  category: 'main',
  description: { id: 'Jumlah total fitur dan perintah bot yang terdaftar', en: 'Total registered bot features and commands' },
  usage: '.totalfitur',
  example: '.totalfitur',
  cooldown: 5,
}

export const i18n = {
  id: { totalfitur: { body: '📊 KANA punya *{plugins} fitur* dengan total *{commands} perintah* (termasuk alias) dari {categories} kategori. Semua siap dipakai, mulai dari .menu yaa~ {mood}' } },
  en: { totalfitur: { body: '📊 KANA has *{plugins} features* with a total of *{commands} commands* (aliases included) across {categories} categories. All ready to use, start from .menu~ {mood}' } },
}

export const test = { input: '.totalfitur', expect: /fitur|feature/i }

export async function handler(ctx) {
  const list = ctx.registry?.list?.() ?? []
  let commands = 0
  const categories = new Set()
  for (const p of list) {
    commands += 1 + (p.config.alias?.length ?? 0)
    if (p.config.category) categories.add(p.config.category)
  }
  return ctx.reply(ctx.t('totalfitur.body', {
    plugins: list.length, commands, categories: categories.size, mood: ctx.say('senang'),
  }))
}
