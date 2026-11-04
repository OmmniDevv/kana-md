// Info identitas chat dari pesan mentah: JID/LID pengirim dan chat.
export const config = {
  name: 'ceklid',
  alias: ['cekjid', 'myid', 'lid'],
  category: 'user',
  description: { id: 'Lihat JID dan LID kamu di chat ini', en: 'See your JID and LID in this chat' },
  usage: '.ceklid',
  example: '.ceklid',
  cooldown: 3,
}

export const i18n = {
  id: { ceklid: { body: '╭─❏ 🪪 「 *IDENTITAS CHAT* 」\n┊ ᴘᴇɴɢɪʀɪᴍ: *{sender}*\n┊ ᴄʜᴀᴛ: *{chat}*\n┊ ᴛɪᴘᴇ: *{type}*\n┊ ɪᴅ ᴘᴇꜱᴀɴ: *{id}*\n╰━━━━━━━' } },
  en: { ceklid: { body: '╭─❏ 🪪 「 *CHAT IDENTITY* 」\n┊ ꜱᴇɴᴅᴇʀ: *{sender}*\n┊ ᴄʜᴀᴛ: *{chat}*\n┊ ᴛʏᴘᴇ: *{type}*\n┊ ᴍᴇꜱꜱᴀɢᴇ ɪᴅ: *{id}*\n╰━━━━━━━' } },
}

export const test = { input: '.ceklid', expect: /identitas|identity/i }

export async function handler(ctx) {
  const key = ctx.raw?.key ?? {}
  const sender = key.participant ?? key.remoteJid ?? ctx.sender ?? '-'
  return ctx.reply(ctx.t('ceklid.body', {
    sender,
    chat: ctx.chat,
    type: ctx.isGroup ? 'grup/group' : 'pribadi/private',
    id: key.id ?? '-',
  }))
}
