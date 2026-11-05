// Dasbor ringkas bot dari statistik nyata: kv bot_stats yang ditulis
// scheduler, jumlah user terdaftar di storage, dan jumlah grup.
export const config = {
  name: 'dashboard',
  alias: ['dasbor'],
  category: 'info',
  description: { id: 'Dasbor ringkas bot: user, perintah, grup, uptime', en: 'Compact bot dashboard: users, commands, groups, uptime' },
  usage: '.dashboard',
  example: '.dashboard',
  cooldown: 5,
}

export const i18n = {
  id: {
    dashboard: {
      body: '╭─❏ 📊 「 *DASHBOARD KANA* 」\n┊ ᴜᴘᴛɪᴍᴇ ᴘʀᴏꜱᴇꜱ: *{uptime}*\n┊ ᴍᴜʟᴀɪ ᴀᴋᴛɪꜰ: *{started}*\n┊ ᴜꜱᴇʀ ᴛᴇʀᴅᴀꜰᴛᴀʀ: *{users}*\n┊ ᴛᴏᴛᴀʟ ᴘᴇʀɪɴᴛᴀʜ ᴅɪᴘʀᴏꜱᴇꜱ: *{commands}*\n┊ ɢʀᴜᴘ ᴛᴇʀᴄᴀᴛᴀᴛ: *{groups}*\n┊ ᴘʟᴜɢɪɴ ᴀᴋᴛɪꜰ: *{plugins}*\n╰━━━━━━━',
    },
  },
  en: {
    dashboard: {
      body: '╭─❏ 📊 「 *KANA DASHBOARD* 」\n┊ ᴘʀᴏᴄᴇꜱꜱ ᴜᴘᴛɪᴍᴇ: *{uptime}*\n┊ ᴀᴄᴛɪᴠᴇ ꜱɪɴᴄᴇ: *{started}*\n┊ ʀᴇɢɪꜱᴛᴇʀᴇᴅ ᴜꜱᴇʀꜱ: *{users}*\n┊ ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ ᴘʀᴏᴄᴇꜱꜱᴇᴅ: *{commands}*\n┊ ʀᴇᴄᴏʀᴅᴇᴅ ɢʀᴏᴜᴘꜱ: *{groups}*\n┊ ᴀᴄᴛɪᴠᴇ ᴘʟᴜɢɪɴꜱ: *{plugins}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.dashboard', expect: /DASHBOARD/ }

function fmtUptime(seconds) {
  const s = Math.floor(seconds)
  const d = Math.floor(s / 86400)
  const h = Math.floor(s % 86400 / 3600)
  const m = Math.floor(s % 3600 / 60)
  const parts = []
  if (d) parts.push(`${d} hari`)
  if (h) parts.push(`${h} jam`)
  parts.push(`${m} mnt`)
  return parts.join(' ')
}

export async function handler(ctx) {
  let stats = null
  try { stats = await ctx.storage.get('kv', 'bot_stats') } catch {}
  let users = stats?.totalUsers ?? 0
  if (!users) {
    try {
      const keys = (await ctx.storage.keys('users')).filter((k) => /^\d+$/.test(k))
      let count = 0
      for (const key of keys) {
        const profile = await ctx.storage.get('users', key)
        if (profile?.registered) count += 1
      }
      users = count
    } catch {}
  }
  let groups = 0
  try { groups = (await ctx.storage.keys('groups')).filter((j) => j.endsWith('@g.us')).length } catch {}
  const plugins = ctx.registry?.list?.().length ?? stats?.pluginCount ?? 0
  return ctx.reply(ctx.t('dashboard.body', {
    uptime: fmtUptime(process.uptime()),
    started: stats?.startedAt ? new Date(stats.startedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-',
    users: Number(users).toLocaleString('id-ID'),
    commands: Number(stats?.totalCommands ?? 0).toLocaleString('id-ID'),
    groups: Number(groups).toLocaleString('id-ID'),
    plugins: Number(plugins).toLocaleString('id-ID'),
  }))
}
