export const config = {
  name: 'help',
  alias: ['bantuan'],
  category: 'main',
  description: { id: 'Lihat detail satu perintah', en: 'See details of one command' },
  usage: '.help <perintah>',
  example: '.help ping',
  cooldown: 3,
}

export const i18n = {
  id: {
    help: {
      detail: 'Perintah: .{name}\nDeskripsi: {desc}\nCara pakai: {usage}\nContoh: {example}',
      hint: 'Ketik .help <perintah> buat detailnya, contoh: .help ping~',
    },
  },
  en: {
    help: {
      detail: 'Command: .{name}\nDescription: {desc}\nUsage: {usage}\nExample: {example}',
      hint: 'Type .help <command> for details, example: .help ping~',
    },
  },
}

export async function handler(ctx) {
  const target = ctx.args[0]
  if (!target) return ctx.reply(ctx.t('help.hint'))
  const plugin = ctx.registry.resolve(target)
  if (!plugin) return ctx.reply(ctx.t('common.notFound', { command: target }))
  const c = plugin.config
  await ctx.reply(
    ctx.t('help.detail', {
      name: c.name,
      desc: c.description?.[ctx.lang] ?? c.description?.id ?? '',
      usage: c.usage ?? `.${c.name}`,
      example: c.example ?? `.${c.name}`,
    })
  )
}
