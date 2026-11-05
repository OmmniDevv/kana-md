
import { downloadBuffer } from '../../src/scrapers/runner.js'
export const config = {
  name: "sfiledl",
  alias: [],
  category: "download",
  description: { id: "Download file dari Sfile.mobi", en: "KANA version of the Elaina-MD sfiledl feature, rewritten in KANA style" },
  usage: ".sfiledl",
  example: ".sfiledl",
  cooldown: 5,
  limitGroup: "download",
}

export const i18n = {
  id: {
    "sfiledl": {
      hint: "╭─❏ 📥 「 *SFILEDL* 」\n┊ Kirim link youtube-nya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.sfiledl https://...*\n╰━━━━━━━",
      working: "╭─❏ 📥 「 *LAGI DIAMBIL* 」\n┊ Sebentar, KANA ambil medianya dulu... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *UNDUHAN GAGAL* 」\n┊ Mouu, unduhannya gagal: *{message}*\n┊ Sumbernya lagi bermasalah, coba lagi nanti ya~\n╰━━━━━━━",
      caption: "╭─❏ 📥 「 *SFILEDL* 」\n┊ Nih medianya~\n╰━━━━━━━",
    },
  },
  en: {
    "sfiledl": {
      hint: "╭─❏ 📥 「 *SFILEDL* 」\n┊ Send the youtube link first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.sfiledl https://...*\n╰━━━━━━━",
      working: "╭─❏ 📥 「 *FETCHING IT* 」\n┊ One sec, KANA is fetching the media... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *DOWNLOAD FAILED* 」\n┊ Mouu, the download failed: *{message}*\n┊ The source is having trouble, try again later~\n╰━━━━━━━",
      caption: "╭─❏ 📥 「 *SFILEDL* 」\n┊ Here is your media~\n╰━━━━━━━",
    },
  },
}

const PLATFORM = "youtube"
export const test = { input: '.sfiledl https://sfile.mobi/', expect: /.+/ }
function pickMediaUrl(obj, depth = 0) {
  if (!obj || depth > 4) return null
  if (typeof obj === 'string') return /^https:\/\//.test(obj) ? obj : null
  if (Array.isArray(obj)) { for (const v of obj) { const u = pickMediaUrl(v, depth + 1); if (u) return u } return null }
  if (typeof obj === 'object') {
    for (const k of ['video', 'nowm', 'noWatermark', 'play', 'download', 'downloadUrl', 'audio', 'url', 'image', 'thumbnail']) {
      if (obj[k]) { const u = pickMediaUrl(obj[k], depth + 1); if (u) return u }
    }
    for (const v of Object.values(obj)) { const u = pickMediaUrl(v, depth + 1); if (u) return u }
  }
  return null
}
export async function handler(ctx) {
  const url = ((ctx.text || '').match(/https?:\/\/[^\s]+/) || [])[0]
  if (!url) return ctx.reply(ctx.t('sfiledl.hint'))
  await ctx.reply(ctx.t('sfiledl.working', { mood: ctx.say('mikir') }))
  try {
    let result = null
    if (PLATFORM === 'tiktok') { const { tiktokDownload } = await import('../../src/scrapers/tiktok/tiktok.js'); result = await tiktokDownload(url) }
    else if (PLATFORM === 'instagram') { const { instagramDownload } = await import('../../src/scrapers/instagram/instagram.js'); result = await instagramDownload(url) }
    else if (PLATFORM === 'facebook') { const { facebookDownload } = await import('../../src/scrapers/facebook/facebook.js'); result = await facebookDownload(url) }
    else if (PLATFORM === 'spotify') { const { spotifyDownload } = await import('../../src/scrapers/spotify/spotify.js'); result = await spotifyDownload(url) }
    else if (PLATFORM === 'capcut') { const { capcutDownload } = await import('../../src/scrapers/download/capcut.js'); result = await capcutDownload(url) }
    else if (PLATFORM === 'mediafire') { const { resolveMediafire } = await import('../../src/scrapers/download/mediafire.js'); result = await resolveMediafire(url) }
    else if (PLATFORM === 'pixeldrain') { const { extractPixeldrainId, pixeldrainFileUrl } = await import('../../src/scrapers/download/pixeldrain.js'); const id = extractPixeldrainId(url); result = { url: pixeldrainFileUrl(id) } }
    else if (PLATFORM === 'soundcloud') { const { soundcloudAudio } = await import('../../src/scrapers/download/soundcloud.js'); const audio = await soundcloudAudio(url); await ctx.sock.sendMessage(ctx.chat, { audio: audio.buffer ?? audio, mimetype: 'audio/mpeg' }, { quoted: ctx.raw }); return ctx.reply(ctx.t('sfiledl.caption')) }
    else if (PLATFORM === 'youtube') { const { downloadVideoByUrlOrQuery } = await import('../../src/scrapers/download/ytmp4.js'); const v = await downloadVideoByUrlOrQuery(url); await ctx.sock.sendMessage(ctx.chat, { video: v.buffer ?? v, caption: ctx.t('sfiledl.caption') }, { quoted: ctx.raw }); return undefined }
    const mediaUrl = pickMediaUrl(result)
    if (!mediaUrl) throw new Error('media tidak ditemukan dari sumber')
    const media = await downloadBuffer(mediaUrl, { maxBytes: 64 * 1024 * 1024, timeout: 60000 })
    const isAudio = /\.mp3|audio/i.test(mediaUrl)
    if (isAudio) await ctx.sock.sendMessage(ctx.chat, { audio: media.buffer, mimetype: 'audio/mpeg' }, { quoted: ctx.raw })
    else if (/\.(jpg|jpeg|png|webp)/i.test(mediaUrl)) await ctx.sock.sendMessage(ctx.chat, { image: media.buffer, caption: ctx.t('sfiledl.caption') }, { quoted: ctx.raw })
    else await ctx.sock.sendMessage(ctx.chat, { video: media.buffer, caption: ctx.t('sfiledl.caption') }, { quoted: ctx.raw })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('sfiledl.fail', { message: err.message }))
  }
}
