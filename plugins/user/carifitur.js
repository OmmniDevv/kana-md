import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'carifitur',
  alias: ['find', 'cari'],
  category: 'user',
  description: { id: 'Cari perintah berdasarkan kata kunci', en: 'Search commands by keyword' },
  usage: '.carifitur <kata>',
  example: '.carifitur spotify',
  cooldown: 3,
}

export const i18n = {
  id: {
    carifitur: {
      hint: 'Tulis kata kuncinya dulu yaa, contoh: .carifitur spotify~',
      noResult: 'Mouu, nggak ada perintah yang cocok sama "{query}". Coba kata lain yaa~ {mood}',
      header: 'Hasil pencarian "{query}" ({count}):\n{rows}',
    },
  },
  en: {
    carifitur: {
      hint: 'Write the keyword first, example: .carifitur spotify~',
      noResult: 'Mouu, no command matches "{query}". Try another word~ {mood}',
      header: 'Search results for "{query}" ({count}):\n{rows}',
    },
  },
}

export async function handler(ctx) {
  const query = ctx.text.trim().toLowerCase()
  if (!query) return ctx.reply(ctx.t('carifitur.hint'))
  const results = ctx.registry.list().filter((plugin) => {
    const c = plugin.config
    const haystack = [
      c.name,
      ...(c.alias ?? []),
      c.category ?? '',
      c.description?.id ?? '',
      c.description?.en ?? '',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
  if (!results.length) {
    return ctx.reply(ctx.t('carifitur.noResult', { query: ctx.text.trim(), mood: ctx.say('gagal') }))
  }
  const shown = results.slice(0, 15)
  const rows = shown.map((plugin) => {
    const c = plugin.config
    const desc = c.description?.[ctx.lang] ?? c.description?.id ?? ''
    return `.${c.name} : ${desc}`
  })
  const body = ctx.t('carifitur.header', { query: ctx.text.trim(), count: shown.length, rows: rows.join('\n') })
  const replies = shown.slice(0, 5).map((plugin) => ({ text: `.${plugin.config.name}`, id: `.${plugin.config.name}` }))
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
