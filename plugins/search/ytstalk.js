// Stalk channel YouTube publik dari halaman channel resminya. Data
// tertanam di ytInitialData (nama channel, subscriber, jumlah video);
// terverifikasi 2026-11-05 untuk @YouTube.
export const config = {
  name: 'ytstalk',
  alias: ['ytchannel', 'stalkyt'],
  category: 'search',
  description: { id: 'Stalk channel YouTube: subscriber, jumlah video, deskripsi', en: 'Stalk a YouTube channel: subscribers, video count, description' },
  usage: '.ytstalk <@handle atau link channel>',
  example: '.ytstalk @YouTube',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    ytstalk: {
      needUser: '╭─❏ ▶️ 「 *KETIK HANDLE CHANNELNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.ytstalk @YouTube*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *CHANNEL TIDAK KETEMU* 」\n┊ Mouu, channel *{user}* tidak ketemu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL STALK* 」\n┊ Mouu, gagal ambil data channelnya: *{message}*\n╰━━━━━━━',
      body: '╭─❏ ▶️ 「 *{name}* 」\n┊ ʜᴀɴᴅʟᴇ: *{handle}*\n┊ ꜱᴜʙꜱᴄʀɪʙᴇʀ: *{subs}*\n┊ ᴠɪᴅᴇᴏ: *{videos}*\n┊ ᴅᴇꜱᴋʀɪᴘꜱɪ: {desc}\n╰━━━━━━━',
    },
  },
  en: {
    ytstalk: {
      needUser: '╭─❏ ▶️ 「 *TYPE THE CHANNEL HANDLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.ytstalk @YouTube*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *CHANNEL NOT FOUND* 」\n┊ Mouu, the channel *{user}* was not found~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *STALK FAILED* 」\n┊ Mouu, failed to fetch the channel: *{message}*\n╰━━━━━━━',
      body: '╭─❏ ▶️ 「 *{name}* 」\n┊ ʜᴀɴᴅʟᴇ: *{handle}*\n┊ ꜱᴜʙꜱᴄʀɪʙᴇʀꜱ: *{subs}*\n┊ ᴠɪᴅᴇᴏꜱ: *{videos}*\n┊ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ: {desc}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ytstalk @YouTube', expect: /YouTube/ }

// Ekstrak ytInitialData dari HTML channel.
export function extractYtInitialData(html) {
  const m = String(html || '').match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

// Cari nilai teks pertama untuk kunci tertentu secara rekursif (dangkal).
function findText(obj, key, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 8) return null
  if (obj[key]?.simpleText) return obj[key].simpleText
  if (obj[key]?.runs) return obj[key].runs.map((r) => r.text).join('')
  for (const value of Object.values(obj)) {
    const found = findText(value, key, depth + 1)
    if (found) return found
  }
  return null
}

export function parseYtChannel(data, handle) {
  if (!data) return null
  const meta = data.metadata?.channelMetadataRenderer
  const name = meta?.title || findText(data.header || data, 'title')
  if (!name) return null
  const header = data.header || {}
  return {
    name,
    handle: meta?.vanityChannelUrl ? meta.vanityChannelUrl.split('/').pop() : handle,
    subs: findText(header, 'subscriberCountText') || '-',
    videos: findText(header, 'videoCountText') || '-',
    desc: String(meta?.description || '-').slice(0, 200),
  }
}

async function fetchChannel(handle) {
  const path = handle.startsWith('@') ? handle : `@${handle}`
  const res = await fetch(`https://www.youtube.com/${encodeURIComponent(path)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36', 'accept-language': 'en-US' },
  })
  if (!res.ok) throw new Error(`YouTube HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { fetchHtml = fetchChannel } = {}) {
  const raw = (ctx.text || '').trim().split(/\s+/)[0]
  const handle = raw.replace(/^https?:\/\/(www\.)?youtube\.com\//, '')
  if (!handle) return ctx.reply(ctx.t('ytstalk.needUser'))
  let profile
  try {
    profile = parseYtChannel(extractYtInitialData(await fetchHtml(handle)), handle)
  } catch (err) {
    return ctx.reply(ctx.t('ytstalk.failed', { message: err.message }))
  }
  if (!profile) return ctx.reply(ctx.t('ytstalk.notFound', { user: handle }))
  return ctx.reply(ctx.t('ytstalk.body', profile))
}
