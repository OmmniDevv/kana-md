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
      title: '╭─❏ 👥 「 *GRUP YANG KANA IKUTI ({count})* 」\n{list}\n╰━━━━━━━',
      line: '┊ {rank}. *{name}*\n┊ {jid} · *{members} ᴍᴇᴍʙᴇʀ*',
      empty: '╭─❏ 👥 「 *BELUM ADA GRUP* 」\n┊ KANA belum bergabung ke grup mana pun, Master. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL AMBIL GRUP* 」\n┊ Mouu, gagal ambil daftar grup, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    listgrup: {
      title: '╭─❏ 👥 「 *GROUPS KANA IS IN ({count})* 」\n{list}\n╰━━━━━━━',
      line: '┊ {rank}. *{name}*\n┊ {jid} · *{members} members*',
      empty: '╭─❏ 👥 「 *NO GROUPS YET* 」\n┊ KANA is not in any group yet, Master. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *FAILED TO GET GROUPS* 」\n┊ Mouu, failed to get the group list, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
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
