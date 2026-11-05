// Buat paste teks publik lewat dpaste.org (gratis, tanpa kunci).
// API pastebin.com resmi butuh API key developer, jadi dpaste dipakai
// sebagai jalur yang terbukti jalan dari VM (terverifikasi 2026-11-05).
export const config = {
  name: 'pastebin',
  alias: ['up-pb', 'uppb', 'shareteks', 'paste'],
  category: 'tools',
  description: { id: 'Unggah teks jadi tautan paste publik (dpaste)', en: 'Upload text into a public paste link (dpaste)' },
  usage: '.pastebin <teks>',
  example: '.pastebin halo ini teks tes',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    pastebin: {
      needText: '╭─❏ 📋 「 *KETIK TEKSNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.pastebin halo ini teks tes*\n┊ ʙɪꜱᴀ ᴊᴜɢᴀ ʀᴇᴘʟʏ ᴘᴇꜱᴀɴ ᴛᴇᴋꜱ ʟᴀʟᴜ ᴋᴇᴛɪᴋ *.pastebin*.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA unggah teksnya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL UNGGAH* 」\n┊ Mouu, gagal unggah teksnya: *{message}*\n╰━━━━━━━',
      done: '╭─❏ 📋 「 *PASTE JADI* 」\n┊ ɴɪʜ ᴛᴀᴜᴛᴀɴɴʏᴀ: {url}\n┊ ᴋᴇᴅᴀʟᴜᴡᴀʀꜱᴀ ᴏᴛᴏᴍᴀᴛɪꜱ ꜱᴇꜱᴜᴀɪ ᴀᴛᴜʀᴀɴ ᴅᴘᴀꜱᴛᴇ.\n╰━━━━━━━',
    },
  },
  en: {
    pastebin: {
      needText: '╭─❏ 📋 「 *TYPE THE TEXT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.pastebin hello this is a test*\n┊ ʏᴏᴜ ᴄᴀɴ ᴀʟꜱᴏ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴛᴇxᴛ ᴍᴇꜱꜱᴀɢᴇ ᴛʜᴇɴ ᴛʏᴘᴇ *.pastebin*.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is uploading the text... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *UPLOAD FAILED* 」\n┊ Mouu, failed to upload the text: *{message}*\n╰━━━━━━━',
      done: '╭─❏ 📋 「 *PASTE READY* 」\n┊ ʜᴇʀᴇ ɪꜱ ᴛʜᴇ ʟɪɴᴋ: {url}\n┊ ɪᴛ ᴇxᴘɪʀᴇꜱ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ᴘᴇʀ ᴅᴘᴀꜱᴛᴇ ʀᴜʟᴇꜱ.\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pastebin KANA tes paste bot', expect: /dpaste\.org/ }

// Buat paste di dpaste; mengembalikan URL paste.
export async function createPaste(content) {
  const body = new URLSearchParams({ content, syntax: 'text' })
  const res = await fetch('https://dpaste.org/api/', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(20000),
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'KANA-Bot' },
  })
  if (!res.ok) throw new Error(`dpaste HTTP ${res.status}`)
  const url = (await res.text()).trim().replace(/^"|"$/g, '')
  if (!/^https:\/\/dpaste\.org\//.test(url)) throw new Error('respons dpaste tidak dikenal')
  return url
}

function extractText(ctx) {
  const direct = (ctx.text || '').trim()
  if (direct) return direct
  const q = ctx.quoted?.message || {}
  return (q.conversation || q.extendedTextMessage?.text || '').trim()
}

export async function handler(ctx, { create = createPaste } = {}) {
  const text = extractText(ctx)
  if (!text) return ctx.reply(ctx.t('pastebin.needText'))
  await ctx.reply(ctx.t('pastebin.working', { mood: ctx.say('mikir') }))
  try {
    const url = await create(text.slice(0, 60000))
    return ctx.reply(ctx.t('pastebin.done', { url }))
  } catch (err) {
    return ctx.reply(ctx.t('pastebin.failed', { message: err.message }))
  }
}
