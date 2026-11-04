export const config = {
  name: 'owner',
  alias: ['status', 'creator'],
  category: 'owner',
  description: { id: 'Status bot (khusus owner)', en: 'Bot status (owner only)' },
  usage: '.owner',
  example: '.owner',
  isOwner: true,
  cooldown: 3,
}

export const i18n = {
  id: {
    owner: {
      status:
        '╭─❏ 👑 「 *STATUS KANA* 」\n┊ ᴜᴘᴛɪᴍᴇ: *{uptime} detik*\n┊ ᴘʟᴜɢɪɴ ᴀᴋᴛɪꜰ: *{plugins}*\n┊ ᴘʟᴜɢɪɴ ᴋᴀʀᴀɴᴛɪɴᴀ: *{quarantined}*\n┊ ꜱᴛᴏʀᴀɢᴇ: *{driver}*\n┊ ɴᴏᴅᴇ: *{node}*\n╰━━━━━━━ {mood}',
    },
  },
  en: {
    owner: {
      status:
        '╭─❏ 👑 「 *KANA STATUS* 」\n┊ ᴜᴘᴛɪᴍᴇ: *{uptime} seconds*\n┊ ᴀᴄᴛɪᴠᴇ ᴘʟᴜɢɪɴꜱ: *{plugins}*\n┊ ǫᴜᴀʀᴀɴᴛɪɴᴇᴅ ᴘʟᴜɢɪɴꜱ: *{quarantined}*\n┊ ꜱᴛᴏʀᴀɢᴇ: *{driver}*\n┊ ɴᴏᴅᴇ: *{node}*\n╰━━━━━━━ {mood}',
    },
  },
}

export const test = { input: '.owner', expect: /status KANA|uptime/i }

export async function handler(ctx) {
  await ctx.reply(
    ctx.t('owner.status', {
      uptime: Math.floor(process.uptime()),
      plugins: ctx.registry.list().length,
      quarantined: ctx.registry.quarantined.length,
      driver: ctx.storage.driver,
      node: process.version,
      mood: ctx.say('senang'),
    })
  )
}
