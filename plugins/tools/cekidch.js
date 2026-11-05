import { youtubeChannel } from '../../src/scrapers/kindb/social.js'

export const config = {
  name: 'cekidch',
  alias: [],
  category: 'tools',
  description: { id: 'Cek ID dan info channel YouTube dari tautan, handle @, atau nama channel', en: 'Check a YouTube channel ID and info from a link, @handle, or channel name' },
  usage: '.cekidch <tautan atau @handle channel>',
  example: '.cekidch @MrBeast',
  cooldown: 8,
}

export const i18n = {
  id: {
    cekidch: {
      hint: '╭─❏ 📺 「 *CEK ID CHANNEL* 」\n┊ Tempel tautan channel atau handle @ nya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.cekidch @MrBeast*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *CHANNEL TIDAK KETEMU* 」\n┊ Mouu, channel dari *{q}* tidak ketemu atau halamannya tidak memuat ID~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal cek channel: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 📺 「 *{title}* 」\n┊ ɪᴅ ᴄʜᴀɴɴᴇʟ: *{id}*\n┊ ꜱᴜʙꜱᴄʀɪʙᴇʀ: *{subs}*\n┊ ᴛᴀᴜᴛᴀɴ: {url}\n╰━━━━━━━',
    },
  },
  en: {
    cekidch: {
      hint: '╭─❏ 📺 「 *CHECK CHANNEL ID* 」\n┊ Paste the channel link or its @handle~\n┊ ᴇxᴀᴍᴘʟᴇ: *.cekidch @MrBeast*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *CHANNEL NOT FOUND* 」\n┊ Mouu, the channel from *{q}* was not found or its page carries no ID~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to check the channel: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 📺 「 *{title}* 」\n┊ ᴄʜᴀɴɴᴇʟ ɪᴅ: *{id}*\n┊ ꜱᴜʙꜱᴄʀɪʙᴇʀꜱ: *{subs}*\n┊ ʟɪɴᴋ: {url}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.cekidch @MrBeast', expect: /UC[\w-]{22}|MrBeast/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('cekidch.hint'))
  try {
    const ch = await youtubeChannel(q)
    if (!ch) return ctx.reply(ctx.t('cekidch.notfound', { q }))
    return ctx.reply(ctx.t('cekidch.card', { title: ch.title || q, id: ch.channelId, subs: ch.subscribers || '-', url: ch.url }))
  } catch (err) {
    return ctx.reply(ctx.t('cekidch.fail', { message: err.message }))
  }
}
