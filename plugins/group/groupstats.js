import { getGroupSettings } from '../../src/services/group-service.js'
import { aggregateTopchat } from './topchat.js'

export const config = {
  name: 'groupstats',
  alias: [],
  category: 'group',
  description: { id: 'Statistik aktivitas grup: total pesan tercatat, member teraktif, warn beredar, proteksi aktif', en: 'Group activity statistics: recorded messages, most active member, active warns, active protections' },
  usage: '.groupstats',
  example: '.groupstats',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    groupstats: {
      body: '╭─❏ 📊 「 *GROUP STATISTICS* 」\n┊ ɢʀᴜᴘ: *{group}*\n┊ ᴍᴇᴍʙᴇʀ: *{members} orang* ({admins} admin)\n┊ ᴛᴏᴛᴀʟ ᴘᴇꜱᴀɴ ᴛᴇʀᴄᴀᴛᴀᴛ: *{total} pesan*\n┊ ᴍᴇᴍʙᴇʀ ᴛᴇʀᴀᴋᴛɪꜰ: {top}\n┊ ᴍᴇᴍʙᴇʀ ᴀᴋᴛɪꜰ ᴛᴇʀᴄᴀᴛᴀᴛ: *{active} orang*\n┊ ᴡᴀʀɴ ʙᴇʀᴇᴅᴀʀ: *{warns}*\n┊ ᴘʀᴏᴛᴇᴋꜱɪ ᴀᴋᴛɪꜰ: *{protections} fitur*\n╰━━━━━━━ {mood}',
      topLine: '*@{digits}* ({count} pesan)',
      none: 'belum ada data',
    },
  },
  en: {
    groupstats: {
      body: '╭─❏ 📊 「 *GROUP STATISTICS* 」\n┊ ɢʀᴏᴜᴘ: *{group}*\n┊ ᴍᴇᴍʙᴇʀꜱ: *{members} people* ({admins} admins)\n┊ ʀᴇᴄᴏʀᴅᴇᴅ ᴍᴇꜱꜱᴀɢᴇꜱ: *{total} messages*\n┊ ᴍᴏꜱᴛ ᴀᴄᴛɪᴠᴇ ᴍᴇᴍʙᴇʀ: {top}\n┊ ʀᴇᴄᴏʀᴅᴇᴅ ᴀᴄᴛɪᴠᴇ ᴍᴇᴍʙᴇʀꜱ: *{active} people*\n┊ ᴀᴄᴛɪᴠᴇ ᴡᴀʀɴꜱ: *{warns}*\n┊ ᴀᴄᴛɪᴠᴇ ᴘʀᴏᴛᴇᴄᴛɪᴏɴꜱ: *{protections} features*\n╰━━━━━━━ {mood}',
      topLine: '*@{digits}* ({count} messages)',
      none: 'no data yet',
    },
  },
}

const PROTECTION_KEYS = ['antilink', 'antispam', 'antitoxic', 'antijudol', 'antiphising', 'antidocument', 'antisticker', 'antiflood', 'antitagsw', 'antivirtex', 'antihidetag', 'anticulik']

export const test = { input: '.groupstats', expect: /GROUP STATISTICS/ }

// Statistik aktivitas grup dari data nyata: metadata grup, hitungan
// pesan storage chatcount (sumber yang sama dengan .topchat), warn, dan
// pengaturan proteksi grup. Beda dari .grupstats yang fokus ke ringkasan
// metadata dan daftar fitur proteksi.
export async function handler(ctx) {
  const meta = await ctx.sock.groupMetadata(ctx.chat)
  const participants = meta.participants ?? []
  const admins = participants.filter((p) => p.admin).length
  const counts = (await ctx.storage.get('chatcount', ctx.chat)) ?? {}
  const total = Object.values(counts).reduce((acc, n) => acc + Number(n || 0), 0)
  const rows = aggregateTopchat(counts, participants)
  const top = rows.length
    ? ctx.t('groupstats.topLine', { digits: rows[0].digits, count: rows[0].count })
    : ctx.t('groupstats.none')
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const warns = Object.values(settings.warns ?? {}).reduce((acc, w) => acc + Number(w?.count || 0), 0)
  const protections = PROTECTION_KEYS.filter((k) => settings[k]).length
  return ctx.reply(ctx.t('groupstats.body', {
    group: meta.subject || '-',
    members: participants.length,
    admins,
    total,
    top,
    active: rows.length,
    warns,
    protections,
    mood: ctx.say('senang'),
  }), rows.length ? { mentions: [rows[0].jid] } : {})
}
