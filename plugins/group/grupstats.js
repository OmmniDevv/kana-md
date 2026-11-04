import { getGroupSettings } from '../../src/services/group-service.js'

export const config = {
  name: 'grupstats',
  alias: ['statistikgrup'],
  category: 'group',
  description: { id: 'Statistik grup: member, admin, tanggal dibuat, dan proteksi aktif', en: 'Group statistics: members, admins, creation date, and active protections' },
  usage: '.grupstats',
  example: '.grupstats',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    grupstats: {
      body: '╭─❏ 📊 「 *STATISTIK GRUP* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴅɪʙᴜᴀᴛ: *{created}*\n┊ ᴍᴇᴍʙᴇʀ: *{members} orang*\n┊ ᴀᴅᴍɪɴ: *{admins} orang*\n┊ ᴘᴇꜱᴀɴ ᴛᴇʀᴄᴀᴛᴀᴛ (ᴛᴏᴘᴄʜᴀᴛ): *{messages}*\n┊ ᴘʀᴏᴛᴇᴋꜱɪ ᴀᴋᴛɪꜰ: *{protections}*\n┊ ᴍᴏᴅᴇ: *{mode}*\n╰━━━━━━━ {mood}',
      unknown: 'tidak diketahui',
      none: 'tidak ada',
      closed: 'hanya admin (tertutup)',
      open: 'terbuka',
      fail: '╭─❏ ⚠️ 「 *GAGAL AMBIL DATA* 」\n┊ Gagal ambil data grup: {error}\n╰━━━━━━━',
    },
  },
  en: {
    grupstats: {
      body: '╭─❏ 📊 「 *GROUP STATISTICS* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴄʀᴇᴀᴛᴇᴅ: *{created}*\n┊ ᴍᴇᴍʙᴇʀꜱ: *{members}*\n┊ ᴀᴅᴍɪɴꜱ: *{admins}*\n┊ ʀᴇᴄᴏʀᴅᴇᴅ ᴍᴇꜱꜱᴀɢᴇꜱ (ᴛᴏᴘᴄʜᴀᴛ): *{messages}*\n┊ ᴀᴄᴛɪᴠᴇ ᴘʀᴏᴛᴇᴄᴛɪᴏɴꜱ: *{protections}*\n┊ ᴍᴏᴅᴇ: *{mode}*\n╰━━━━━━━ {mood}',
      unknown: 'unknown',
      none: 'none',
      closed: 'admins only (closed)',
      open: 'open',
      fail: '╭─❏ ⚠️ 「 *FAILED TO GET DATA* 」\n┊ Failed to get group data: {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.grupstats', expect: /statistik|statistics/i }

const PROTECTION_KEYS = ['welcome', 'goodbye', 'antilink', 'antispam', 'antitoxic', 'antijudol', 'antiphising', 'antidocument', 'antisticker', 'antiflood', 'antitagsw', 'antivirtex', 'antihidetag']

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch (err) { return ctx.reply(ctx.t('grupstats.fail', { error: err.message })) }
  }
  const s = await getGroupSettings(ctx.storage, ctx.chat)
  const counts = (await ctx.storage.get('chatcount', ctx.chat)) ?? {}
  const messages = Object.values(counts).reduce((sum, n) => sum + Number(n || 0), 0)
  const protections = PROTECTION_KEYS.filter((k) => s[k])
  const created = meta?.creation
    ? new Date(meta.creation * 1000).toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID')
    : ctx.t('grupstats.unknown')
  return ctx.reply(ctx.t('grupstats.body', {
    name: meta?.subject || '-',
    created,
    members: meta?.participants?.length ?? 0,
    admins: (meta?.participants ?? []).filter((p) => p.admin).length,
    messages,
    protections: protections.length ? protections.join(', ') : ctx.t('grupstats.none'),
    mode: meta?.announce ? ctx.t('grupstats.closed') : ctx.t('grupstats.open'),
    mood: ctx.say('senang'),
  }))
}
