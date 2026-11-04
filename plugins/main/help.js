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
      detail:
        '╭───「 HELP 」───\n│ ◦ Perintah : .{name}\n│ ◦ Deskripsi : {desc}\n│ ◦ Cara pakai : {usage}\n│ ◦ Contoh : {example}\n╰━━━━━━━',
      hint: '╭─❏ 💡 ───\n│ Ketik .help <perintah> buat detailnya yaa~\n│ Contoh : .help ping\n╰━━━━━━━',
    },
  },
  en: {
    help: {
      detail:
        '╭───「 HELP 」───\n│ ◦ Command : .{name}\n│ ◦ Description : {desc}\n│ ◦ Usage : {usage}\n│ ◦ Example : {example}\n╰━━━━━━━',
      hint: '╭─❏ 💡 ───\n│ Type .help <command> for the details~\n│ Example : .help ping\n╰━━━━━━━',
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
