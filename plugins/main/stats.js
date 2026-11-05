export const config = {
  name: 'stats',
  alias: [],
  category: 'main',
  description: { id: 'Statistik bot: user terdaftar, grup, perintah dijalankan, plugin aktif', en: 'Bot statistics: registered users, groups, commands served, active plugins' },
  usage: '.stats',
  example: '.stats',
  cooldown: 5,
}

export const i18n = {
  id: {
    stats: {
      body: '╭─❏ 📊 「 *STATISTIK KANA* 」\n┊ 👥 User tercatat: *{users}* (terdaftar: *{registered}*)\n┊ 🏠 Grup diikuti bot: *{groups}*\n┊ ⌨️ Perintah dijalankan: *{commands}*\n┊ 🧩 Plugin aktif: *{plugins}* ({names} nama perintah)\n┊ ⏱️ Berjalan sejak: *{since}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    stats: {
      body: '╭─❏ 📊 「 *KANA STATISTICS* 」\n┊ 👥 Recorded users: *{users}* (registered: *{registered}*)\n┊ 🏠 Groups the bot is in: *{groups}*\n┊ ⌨️ Commands served: *{commands}*\n┊ 🧩 Active plugins: *{plugins}* ({names} command names)\n┊ ⏱️ Running since: *{since}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.stats', expect: /statistik|statistics/i }

export async function handler(ctx) {
  try {
    const userKeys = (await ctx.storage.keys('users')).filter((k) => /^\d+$/.test(k))
    let registered = 0
    for (const digits of userKeys) {
      const profile = await ctx.storage.get('users', digits)
      if (profile?.registered) registered += 1
    }
    // Statistik perintah dan waktu mulai diflush scheduler ke kv bot_stats.
    const flushed = await ctx.storage.get('kv', 'bot_stats')
    let groupCount = null
    try {
      const groups = await ctx.sock.groupFetchAllParticipating()
      groupCount = Object.keys(groups || {}).length
    } catch {
      groupCount = null
    }
    if (groupCount === null) {
      try {
        groupCount = (await ctx.storage.keys('groups')).filter((k) => k.endsWith('@g.us')).length
      } catch {
        groupCount = 0
      }
    }
    const plugins = ctx.registry?.list?.() ?? []
    const names = plugins.reduce((sum, p) => sum + 1 + (p.config?.alias?.length || 0), 0)
    const since = flushed?.startedAt
      ? new Date(flushed.startedAt).toLocaleString(ctx.lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta' })
      : new Date(Date.now() - process.uptime() * 1000).toLocaleString(ctx.lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta' })
    return ctx.reply(ctx.t('stats.body', {
      users: userKeys.length,
      registered,
      groups: groupCount,
      commands: flushed?.totalCommands ?? 0,
      plugins: plugins.length,
      names,
      since,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('stats.fail', { error: err.message }))
  }
}
