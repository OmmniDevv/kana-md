import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, sendVideo, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

// Unduh media dari tautan X/Twitter lewat API publik FxTwitter
// (api.fxtwitter.com, tanpa kunci). Terverifikasi dari VM 2026-11-05:
// endpoint profil dan status menjawab JSON terstruktur.
export const config = {
  name: 'twitter',
  alias: ['tw', 'xdl'],
  category: 'download',
  description: { id: 'Unduh foto atau video dari tautan X (Twitter)', en: 'Download photos or videos from an X (Twitter) link' },
  usage: '.twitter <link tweet>',
  example: '.twitter https://x.com/user/status/1234567890',
  cooldown: 15,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    twitter: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK TWEET* 」\n┊ ᴄᴏɴᴛᴏʜ: *.twitter https://x.com/user/status/123*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambil medianya dulu... {mood}\n╰━━━━━━━',
      noMedia: '╭─❏ 🔍 「 *TIDAK ADA MEDIA* 」\n┊ Tweet itu tidak punya foto atau video yang bisa diunduh~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL UNDUH* 」\n┊ Mouu, gagal ambil media tweetnya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      caption: '╭─❏ 🐦 「 *X / TWITTER* 」\n┊ ᴅᴀʀɪ: *@{user}*\n┊ {text}\n╰━━━━━━━',
    },
  },
  en: {
    twitter: {
      needUrl: '╭─❏ 🔗 「 *SEND A TWEET LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.twitter https://x.com/user/status/123*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the media... {mood}\n╰━━━━━━━',
      noMedia: '╭─❏ 🔍 「 *NO MEDIA* 」\n┊ That tweet has no downloadable photo or video~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *DOWNLOAD FAILED* 」\n┊ Mouu, failed to fetch the tweet media: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      caption: '╭─❏ 🐦 「 *X / TWITTER* 」\n┊ ꜰʀᴏᴍ: *@{user}*\n┊ {text}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.twitter https://x.com/jack/status/20', expect: /TWITTER|MEDIA|media/ }

// Ekstrak { user, id } dari tautan x.com/twitter.com, atau null.
export function parseTweetUrl(text) {
  const m = String(text || '').match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)\/status(?:es)?\/(\d+)/)
  if (m) return { user: m[1], id: m[2] }
  const bare = String(text || '').match(/(?:x\.com|twitter\.com)\/i\/status\/(\d+)/)
  if (bare) return { user: null, id: bare[1] }
  return null
}

// Normalisasi media dari respons FxTwitter menjadi daftar unduhan.
export function parseFxTweet(json) {
  const tweet = json?.tweet
  if (!tweet) return null
  const items = []
  const media = tweet.media || {}
  for (const photo of media.photos || []) {
    if (photo.url) items.push({ type: 'image', url: photo.url })
  }
  for (const video of media.videos || []) {
    if (video.url) items.push({ type: 'video', url: video.url })
  }
  if (!items.length) {
    for (const item of media.all || []) {
      if (item.url) items.push({ type: item.type === 'video' ? 'video' : 'image', url: item.url })
    }
  }
  return {
    user: tweet.author?.screen_name || '',
    text: String(tweet.text || '').slice(0, 300),
    items,
  }
}

async function fetchFxTweet({ user, id }) {
  const path = user ? `${encodeURIComponent(user)}/status/${id}` : `i/status/${id}`
  const res = await fetch(`https://api.fxtwitter.com/${path}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`FxTwitter HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { fetchTweet = fetchFxTweet } = {}) {
  const target = parseTweetUrl(ctx.text || '')
  if (!target) return ctx.reply(ctx.t('twitter.needUrl'))
  await ctx.reply(ctx.t('twitter.working', { mood: ctx.say('mikir') }))
  let parsed
  try {
    parsed = parseFxTweet(await fetchTweet(target))
  } catch (err) {
    return ctx.reply(ctx.t('twitter.failed', { message: err.message }))
  }
  if (!parsed || !parsed.items.length) return ctx.reply(ctx.t('twitter.noMedia'))
  const caption = ctx.t('twitter.caption', { user: parsed.user || '-', text: parsed.text || '-' })
  let sent = 0
  for (const item of parsed.items.slice(0, 4)) {
    try {
      if (item.type === 'video') {
        const { buffer } = await downloadBuffer(item.url, { maxBytes: MAX_VIDEO_BYTES, timeout: 60000 })
        await sendVideo(ctx, buffer, { caption: sent === 0 ? caption : undefined })
      } else {
        const { buffer } = await downloadBuffer(item.url, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 })
        await sendImage(ctx, buffer, { caption: sent === 0 ? caption : undefined })
      }
      sent += 1
    } catch {
      // Lewati media yang gagal diunduh.
    }
  }
  if (!sent) return ctx.reply(ctx.t('twitter.failed', { message: 'media gagal diunduh' }))
  return undefined
}
