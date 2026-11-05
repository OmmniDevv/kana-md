import { pinterestSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

// Cari video di Pinterest dan kirim hasil video teratasnya. Scraper
// Pinterest sehat memberi field video untuk pin yang memang video.
export const config = {
  name: 'pinvid',
  alias: [],
  category: 'search',
  description: { id: 'Cari dan kirim video dari Pinterest', en: 'Search and send a video from Pinterest' },
  usage: '.pinvid <kata kunci>',
  example: '.pinvid kucing lucu',
  cooldown: 15,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    pinvid: {
      needQuery: '╭─❏ 🎬 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.pinvid kucing lucu*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *VIDEO TIDAK KETEMU* 」\n┊ Mouu, nggak ada video Pinterest buat kata kunci itu~\n┊ Coba *.pinvid* kata lain atau *.pin* buat gambar ya.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL VIDEO* 」\n┊ Mouu, gagal ambil videonya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *PINTEREST VIDEO* 」\n┊ {title}\n┊ 🔗 {link}\n╰━━━━━━━',
    },
  },
  en: {
    pinvid: {
      needQuery: '╭─❏ 🎬 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.pinvid funny cat*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO VIDEO FOUND* 」\n┊ Mouu, no Pinterest video for those keywords~\n┊ Try other keywords with *.pinvid* or *.pin* for images.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH VIDEO* 」\n┊ Mouu, failed to fetch the video: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *PINTEREST VIDEO* 」\n┊ {title}\n┊ 🔗 {link}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pinvid kucing', expect: /PINTEREST VIDEO/ }

export async function handler(ctx, { search = pinterestSearch } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('pinvid.needQuery'))
  let pins
  try {
    pins = await search(q, { limit: 20 })
  } catch (err) {
    return ctx.reply(ctx.t('pinvid.failed', { message: err.message }))
  }
  const videos = (pins || []).filter((p) => p.type === 'video' && p.video)
  if (!videos.length) return ctx.reply(ctx.t('pinvid.notFound'))
  const pin = videos[0]
  let buffer
  try {
    ;({ buffer } = await downloadBuffer(pin.video, { maxBytes: MAX_VIDEO_BYTES, timeout: 60000 }))
  } catch (err) {
    return ctx.reply(ctx.t('pinvid.failed', { message: err.message }))
  }
  await sendVideo(ctx, buffer, {
    caption: ctx.t('pinvid.caption', { title: pin.title || q, link: pin.link || '-' }),
  })
  return undefined
}
