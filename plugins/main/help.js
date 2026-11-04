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
        '╭─❏ ❓ 「 *HELP* 」\n┊ ᴘᴇʀɪɴᴛᴀʜ: *.{name}*\n┊ ᴅᴇꜱᴋʀɪᴘꜱɪ: {desc}\n┊ ᴄᴀʀᴀ ᴘᴀᴋᴀɪ: *{usage}*\n┊ ᴄᴏɴᴛᴏʜ: *{example}*\n╰━━━━━━━',
      hint: '╭─❏ 💡 「 *BANTUAN* 」\n┊ Ketik *.help <perintah>* buat detailnya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.help ping*\n╰━━━━━━━',
    },
  },
  en: {
    help: {
      detail:
        '╭─❏ ❓ 「 *HELP* 」\n┊ ᴄᴏᴍᴍᴀɴᴅ: *.{name}*\n┊ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ: {desc}\n┊ ᴜꜱᴀɢᴇ: *{usage}*\n┊ ᴇxᴀᴍᴘʟᴇ: *{example}*\n╰━━━━━━━',
      hint: '╭─❏ 💡 「 *HELP* 」\n┊ Type *.help <command>* for the details~\n┊ ᴇxᴀᴍᴘʟᴇ: *.help ping*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.help ping', expect: /ping/i }

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
