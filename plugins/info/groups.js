// Daftar grup yang diikuti bot saat ini, dari data partisipasi
// WhatsApp langsung (groupFetchAllParticipating).
export const config = {
  name: 'groups',
  alias: ['listgrupbot', 'botgroups'],
  category: 'info',
  description: { id: 'Daftar grup yang diikuti bot beserta jumlah membernya', en: 'List the groups the bot is in with member counts' },
  usage: '.groups',
  example: '.groups',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    groups: {
      failed: '╭─❏ 😿 「 *GAGAL AMBIL GRUP* 」\n┊ Mouu, gagal ambil daftar grupnya: *{message}*\n╰━━━━━━━',
      empty: '╭─❏ 👥 「 *BELUM ADA GRUP* 」\n┊ Bot belum masuk grup mana pun~\n╰━━━━━━━',
      header: '╭─❏ 👥 「 *GRUP BOT ({total})* 」',
      item: '┊ {n}. *{name}*\n┊ 👥 {members} member | 🆔 {jid}',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    groups: {
      failed: '╭─❏ 😿 「 *FAILED TO FETCH GROUPS* 」\n┊ Mouu, failed to fetch the group list: *{message}*\n╰━━━━━━━',
      empty: '╭─❏ 👥 「 *NO GROUPS YET* 」\n┊ The bot is not in any group yet~\n╰━━━━━━━',
      header: '╭─❏ 👥 「 *BOT GROUPS ({total})* 」',
      item: '┊ {n}. *{name}*\n┊ 👥 {members} members | 🆔 {jid}',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.groups', expect: /GRUP BOT|BOT GROUPS/ }

// Ubah hasil groupFetchAllParticipating menjadi daftar ringkas.
export function parseParticipating(map) {
  if (!map || typeof map !== 'object') return []
  return Object.values(map).map((g) => ({
    name: g.subject || '-',
    members: Array.isArray(g.participants) ? g.participants.length : 0,
    jid: g.id,
  })).sort((a, b) => b.members - a.members)
}

export async function handler(ctx) {
  let list
  try {
    list = parseParticipating(await ctx.sock.groupFetchAllParticipating())
  } catch (err) {
    return ctx.reply(ctx.t('groups.failed', { message: err.message }))
  }
  if (!list.length) return ctx.reply(ctx.t('groups.empty'))
  const lines = [ctx.t('groups.header', { total: list.length })]
  list.slice(0, 20).forEach((g, i) => lines.push(ctx.t('groups.item', { n: i + 1, ...g })))
  lines.push(ctx.t('groups.footer'))
  return ctx.reply(lines.join('\n'))
}
