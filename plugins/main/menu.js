import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'menu',
  alias: ['m'],
  category: 'main',
  description: { id: 'Tampilkan daftar perintah', en: 'Show the command list' },
  usage: '.menu',
  example: '.menu',
  cooldown: 5,
}

export async function handler(ctx) {
  const byCategory = new Map()
  for (const plugin of ctx.registry.list()) {
    const cat = plugin.config.category ?? 'main'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat).push(plugin)
  }
  const lines = []
  const replies = []
  for (const [cat, plugins] of byCategory) {
    lines.push(ctx.t('menu.category', { category: cat }))
    for (const p of plugins) {
      const desc = p.config.description?.[ctx.lang] ?? p.config.description?.id ?? ''
      lines.push(`.${p.config.name} : ${desc}`)
      if (replies.length < 10) replies.push({ text: `.${p.config.name}`, id: p.config.name })
    }
  }
  const body = `${ctx.t('menu.body', { name: 'Master' })}\n\n${lines.join('\n')}`
  await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('menu.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
