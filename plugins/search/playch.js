import { playSong } from '../../src/scrapers/youtube/youtube.js'
import { MAX_AUDIO_BYTES as RUNNER_MAX } from '../../src/ui/media.js'
import { sendAudio } from '../../src/ui/media.js'

// Putar lagu ke saluran (channel) WhatsApp: cari lagu di YouTube lalu
// kirim audionya ke channel tujuan. Butuh argumen --idch <id channel>.
export const config = {
  name: 'playch',
  alias: [],
  category: 'search',
  description: { id: 'Putar lagu ke channel WhatsApp (butuh --idch <id channel>)', en: 'Play a song into a WhatsApp channel (needs --idch <channel id>)' },
  usage: '.playch <judul lagu> --idch <id channel>',
  example: '.playch Tulus Sepatu --idch 120363000000000000',
  cooldown: 20,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    playch: {
      needArgs: '╭─❏ 📣 「 *FORMATNYA KURANG* 」\n┊ ᴄᴏɴᴛᴏʜ: *.playch Tulus Sepatu --idch 120363...*\n┊ ɪᴅ ᴄʜᴀɴɴᴇʟ ʙɪꜱᴀ ᴅɪᴀᴍʙɪʟ ᴅᴀʀɪ ʟɪɴᴋ ᴄʜᴀɴɴᴇʟ: *whatsapp.com/channel/<id>*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA kirim lagunya ke channel... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL KIRIM* 」\n┊ Mouu, gagal kirim lagunya ke channel: *{message}*\n┊ ᴘᴀꜱᴛɪᴋᴀɴ ʙᴏᴛ ꜱᴜᴅᴀʜ ᴊᴀᴅɪ ꜰᴏʟʟᴏᴡᴇʀ ᴀᴛᴀᴜ ᴀᴅᴍɪɴ ᴄʜᴀɴɴᴇʟɴʏᴀ.\n╰━━━━━━━',
      sent: '╭─❏ 📣 「 *TERKIRIM KE CHANNEL* 」\n┊ 🎵 *{title}*\n┊ 📣 ᴄʜᴀɴɴᴇʟ: *{jid}*\n╰━━━━━━━',
    },
  },
  en: {
    playch: {
      needArgs: '╭─❏ 📣 「 *MISSING ARGUMENTS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.playch Tulus Sepatu --idch 120363...*\n┊ ᴛʜᴇ ᴄʜᴀɴɴᴇʟ ɪᴅ ᴄᴏᴍᴇꜱ ꜰʀᴏᴍ ᴛʜᴇ ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ: *whatsapp.com/channel/<id>*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is sending the song to the channel... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO SEND* 」\n┊ Mouu, failed to send the song to the channel: *{message}*\n┊ ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ꜰᴏʟʟᴏᴡꜱ ᴏʀ ᴀᴅᴍɪɴꜱ ᴛʜᴇ ᴄʜᴀɴɴᴇʟ.\n╰━━━━━━━',
      sent: '╭─❏ 📣 「 *SENT TO CHANNEL* 」\n┊ 🎵 *{title}*\n┊ 📣 ᴄʜᴀɴɴᴇʟ: *{jid}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.playch Tulus Sepatu --idch 120363000000000000', expect: /CHANNEL|ᴄʜᴀɴɴᴇʟ/ }

// Pisahkan judul dan target channel dari teks perintah.
export function parsePlaych(text) {
  const m = String(text || '').match(/--idch\s+(\S+)/)
  if (!m) return null
  let id = m[1].trim()
  if (id.includes('@newsletter')) id = id
  else if (/^\d+$/.test(id)) id = `${id}@newsletter`
  else if (!id.includes('@')) id = `${id}@newsletter`
  const query = String(text).replace(/--idch\s+\S+/, '').trim()
  if (!query) return null
  return { query, jid: id }
}

export async function handler(ctx) {
  const parsed = parsePlaych(ctx.text || '')
  if (!parsed) return ctx.reply(ctx.t('playch.needArgs'))
  await ctx.reply(ctx.t('playch.working', { mood: ctx.say('mikir') }))
  try {
    const result = await playSong(parsed.query, { maxBytes: RUNNER_MAX })
    const title = result.selected?.title || result.info?.title || parsed.query
    await sendAudio({ ...ctx, chat: parsed.jid }, result.buffer, {
      title,
      performer: result.selected?.artist || result.info?.artist || '',
      mimetype: result.mimeType,
    })
    return ctx.reply(ctx.t('playch.sent', { title, jid: parsed.jid }))
  } catch (err) {
    return ctx.reply(ctx.t('playch.failed', { message: err.message }))
  }
}
