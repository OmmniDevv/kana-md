export const config = {
  name: 'listgrup',
  alias: ['daftargrup', 'listgroup', 'grouplist'],
  category: 'owner',
  description: { id: 'Daftar semua grup yang bot ikuti (owner)', en: 'List all groups the bot is in (owner)' },
  usage: '.listgrup',
  example: '.listgrup',
  cooldown: 10,
  isOwner: true,
}

export const i18n = {
  id: {
    listgrup: {
      title: '📋 GRUP YANG KANA IKUTI ({count})\n\n{list}',
      line: '{rank}. {name}\n    {jid} · {members} member',
      empty: 'KANA belum bergabung ke grup mana pun, Master. {mood}',
      fail: 'Gagal ambil daftar grup, Master: {error}',
    },
  },
  en: {
    listgrup: {
      title: '📋 GROUPS KANA IS IN ({count})\n\n{list}',
      line: '{rank}. {name}\n    {jid} · {members} members',
      empty: 'KANA is not in any group yet, Master. {mood}',
      fail: 'Failed to get the group list, Master: {error}',
    },
  },
}

export const test = { input: '.listgrup', expect: /grup|group/i }

export async function handler(ctx) {
  try {
    const all = await ctx.sock.groupFetchAllParticipating()
    const groups = Object.values(all ?? {})
    if (!groups.length) return ctx.reply(ctx.t('listgrup.empty', { mood: ctx.say('malu') }))
    const list = groups
      .slice(0, 50)
      .map((g, i) => ctx.t('listgrup.line', { rank: i + 1, name: g.subject || '-', jid: g.id, members: g.participants?.length ?? 0 }))
      .join('\n')
    return ctx.reply(ctx.t('listgrup.title', { count: groups.length, list }))
  } catch (err) {
    return ctx.reply(ctx.t('listgrup.fail', { error: err.message }))
  }
}
