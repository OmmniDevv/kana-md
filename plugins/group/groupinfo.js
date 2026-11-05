import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'groupinfo',
  alias: [],
  category: 'group',
  description: { id: 'Menampilkan informasi lengkap grup: nama, id, pemilik, jumlah member dan admin, deskripsi', en: 'Show complete group info: name, id, owner, member and admin counts, description' },
  usage: '.groupinfo',
  example: '.groupinfo',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    groupinfo: {
      body: '╭─❏ ℹ️ 「 *INFO GRUP* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ID GRUP: *{id}*\n┊ ᴘᴇᴍɪʟɪᴋ: *@{owner}*\n┊ ᴅɪʙᴜᴀᴛ: *{created}*\n┊ ᴍᴇᴍʙᴇʀ: *{members} orang*\n┊ ᴀᴅᴍɪɴ: *{admins} orang*\n┊ ᴍᴏᴅᴇ ᴄʜᴀᴛ: *{chatMode}*\n┊ ᴅᴇꜱᴋʀɪᴘꜱɪ: {desc}\n╰━━━━━━━ {mood}',
      announcement: 'hanya admin (pengumuman)',
      openMode: 'semua member',
      noDesc: '(belum ada deskripsi)',
      unknown: 'tidak diketahui',
    },
  },
  en: {
    groupinfo: {
      body: '╭─❏ ℹ️ 「 *GROUP INFO* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ GROUP ID: *{id}*\n┊ ᴏᴡɴᴇʀ: *@{owner}*\n┊ ᴄʀᴇᴀᴛᴇᴅ: *{created}*\n┊ ᴍᴇᴍʙᴇʀꜱ: *{members} people*\n┊ ᴀᴅᴍɪɴꜱ: *{admins} people*\n┊ ᴄʜᴀᴛ ᴍᴏᴅᴇ: *{chatMode}*\n┊ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ: {desc}\n╰━━━━━━━ {mood}',
      announcement: 'admins only (announcement)',
      openMode: 'all members',
      noDesc: '(no description yet)',
      unknown: 'unknown',
    },
  },
}

export const test = { input: '.groupinfo', expect: /INFO GRUP[\s\S]*ID GRUP|GROUP INFO[\s\S]*GROUP ID/ }

export async function handler(ctx) {
  const meta = await ctx.sock.groupMetadata(ctx.chat)
  const participants = meta.participants ?? []
  const admins = participants.filter((p) => p.admin)
  const ownerParticipant = participants.find((p) => p.admin === 'superadmin')
  const ownerJid = meta.owner || ownerParticipant?.phoneNumber || ownerParticipant?.id || ''
  const created = meta.creation
    ? new Date(meta.creation * 1000).toLocaleDateString(ctx.lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ctx.t('groupinfo.unknown')
  return ctx.reply(ctx.t('groupinfo.body', {
    name: meta.subject || '-',
    id: meta.id || ctx.chat,
    owner: ownerJid ? digitsOf(ownerJid) : ctx.t('groupinfo.unknown'),
    created,
    members: participants.length,
    admins: admins.length,
    chatMode: ctx.t(meta.announce ? 'groupinfo.announcement' : 'groupinfo.openMode'),
    desc: meta.desc ? String(meta.desc).slice(0, 300) : ctx.t('groupinfo.noDesc'),
    mood: ctx.say('senang'),
  }), ownerJid ? { mentions: [ownerJid] } : {})
}
