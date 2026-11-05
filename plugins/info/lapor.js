// Lapor bug atau masalah ke owner: laporan disimpan di storage
// namespace 'reports' dan diteruskan ke chat owner saat itu juga.
export const config = {
  name: 'lapor',
  alias: ['laporbug', 'reportbug', 'report'],
  category: 'info',
  description: { id: 'Laporkan bug atau masalah ke owner bot', en: 'Report a bug or problem to the bot owner' },
  usage: '.lapor <isi laporan>',
  example: '.lapor perintah .ping error terus',
  cooldown: 30,
  limit: 2,
}

export const i18n = {
  id: {
    lapor: {
      needText: '╭─❏ 🐞 「 *TULIS LAPORANNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.lapor perintah .ping error terus*\n┊ ᴊᴇʟᴀꜱᴋᴀɴ ᴍᴀꜱᴀʟᴀʜɴʏᴀ ꜱᴇᴅᴇᴛᴀɪʟ ᴍᴜɴɢᴋɪɴ ʏᴀ~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *LAPORAN GAGAL* 」\n┊ Mouu, laporannya gagal disimpan: *{message}*\n╰━━━━━━━',
      done: '╭─❏ 🐞 「 *LAPORAN TERKIRIM* 」\n┊ ɪᴅ ʟᴀᴘᴏʀᴀɴ: *#{id}*\n┊ ᴍᴀᴋᴀꜱɪʜ ʏᴀ, ʟᴀᴘᴏʀᴀɴᴍᴜ ꜱᴜᴅᴀʜ ᴋᴀɴᴀ ᴛᴇʀᴜꜱᴋᴀɴ ᴋᴇ ᴏᴡɴᴇʀ~\n╰━━━━━━━',
      ownerNote: '╭─❏ 🐞 「 *LAPORAN BARU #{id}* 」\n┊ ᴅᴀʀɪ: *{name}* ({digits})\n┊ ᴄʜᴀᴛ: *{chat}*\n┊ ɪꜱɪ: {text}\n╰━━━━━━━',
    },
  },
  en: {
    lapor: {
      needText: '╭─❏ 🐞 「 *WRITE THE REPORT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.lapor the .ping command keeps erroring*\n┊ ᴅᴇꜱᴄʀɪʙᴇ ᴛʜᴇ ᴘʀᴏʙʟᴇᴍ ᴀꜱ ᴄʟᴇᴀʀʟʏ ᴀꜱ ʏᴏᴜ ᴄᴀɴ~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *REPORT FAILED* 」\n┊ Mouu, the report failed to save: *{message}*\n╰━━━━━━━',
      done: '╭─❏ 🐞 「 *REPORT SENT* 」\n┊ ʀᴇᴘᴏʀᴛ ɪᴅ: *#{id}*\n┊ ᴛʜᴀɴᴋꜱ, ʏᴏᴜʀ ʀᴇᴘᴏʀᴛ ʜᴀꜱ ʙᴇᴇɴ ꜰᴏʀᴡᴀʀᴅᴇᴅ ᴛᴏ ᴛʜᴇ ᴏᴡɴᴇʀ~\n╰━━━━━━━',
      ownerNote: '╭─❏ 🐞 「 *NEW REPORT #{id}* 」\n┊ ꜰʀᴏᴍ: *{name}* ({digits})\n┊ ᴄʜᴀᴛ: *{chat}*\n┊ ᴄᴏɴᴛᴇɴᴛ: {text}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.lapor tes laporan dari livetest', expect: /LAPORAN TERKIRIM|REPORT SENT/ }

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('lapor.needText'))
  const id = String(Date.now()).slice(-6)
  const record = {
    id,
    from: ctx.senderDigits,
    name: ctx.pushName || '',
    chat: ctx.chat,
    text: text.slice(0, 1000),
    at: new Date().toISOString(),
  }
  try {
    await ctx.storage.set('reports', `${Date.now()}-${ctx.senderDigits}`, record)
  } catch (err) {
    return ctx.reply(ctx.t('lapor.failed', { message: err.message }))
  }
  const ownerDigits = String(process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  if (ownerDigits && ownerDigits !== ctx.senderDigits) {
    try {
      await ctx.sock.sendMessage(`${ownerDigits}@s.whatsapp.net`, {
        text: ctx.t('lapor.ownerNote', { id, name: record.name || '-', digits: record.from, chat: record.chat, text: record.text }),
      })
    } catch {}
  }
  return ctx.reply(ctx.t('lapor.done', { id }))
}
