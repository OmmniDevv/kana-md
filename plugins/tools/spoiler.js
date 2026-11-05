// Sembunyikan teks sebagai spoiler gaya WhatsApp: isi ditulis jauh di
// bawah lipatan "Baca selengkapnya" sehingga tidak langsung terbaca.
export const config = {
  name: 'spoiler',
  alias: ['selengkapnya'],
  category: 'tools',
  description: { id: 'Sembunyikan teks sebagai spoiler (di balik Baca selengkapnya)', en: 'Hide text as a spoiler (behind Read more)' },
  usage: '.spoiler <teks rahasia>',
  example: '.spoiler pelakunya adalah si butler',
  cooldown: 5,
}

export const i18n = {
  id: {
    spoiler: {
      needText: '╭─❏ 🙈 「 *KETIK TEKS SPOILERNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.spoiler pelakunya adalah si butler*\n╰━━━━━━━',
      head: '╭─❏ 🙈 「 *SPOILER* 」\n┊ ᴋᴇᴛᴜᴋ *ʙᴀᴄᴀ ꜱᴇʟᴇɴɢᴋᴀᴘɴʏᴀ* ᴅɪ ʙᴀᴡᴀʜ ʙᴜᴀᴛ ᴍᴇᴍʙᴜᴋᴀ ɪꜱɪɴʏᴀ.\n┊ ᴀᴡᴀꜱ, ɪꜱɪɴʏᴀ ʙᴇɴᴇʀᴀɴ ꜱᴘᴏɪʟᴇʀ ʏᴀ~\n╰━━━━━━━',
    },
  },
  en: {
    spoiler: {
      needText: '╭─❏ 🙈 「 *TYPE THE SPOILER TEXT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.spoiler the culprit is the butler*\n╰━━━━━━━',
      head: '╭─❏ 🙈 「 *SPOILER* 」\n┊ ᴛᴀᴘ *ʀᴇᴀᴅ ᴍᴏʀᴇ* ʙᴇʟᴏᴡ ᴛᴏ ʀᴇᴠᴇᴀʟ ᴛʜᴇ ᴄᴏɴᴛᴇɴᴛ.\n┊ ᴄᴀʀᴇꜰᴜʟ, ɪᴛ ɪꜱ ᴀ ʀᴇᴀʟ ꜱᴘᴏɪʟᴇʀ~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.spoiler dia adalah pelakunya', expect: /SPOILER/ }

const FOLD_LINES = 70

// Bungkus teks ke dalam lipatan spoiler.
export function wrapSpoiler(text, head) {
  return head + '\n' + '·\n'.repeat(FOLD_LINES) + String(text)
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('spoiler.needText'))
  return ctx.reply(wrapSpoiler(text, ctx.t('spoiler.head')))
}
