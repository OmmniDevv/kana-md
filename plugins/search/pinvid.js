import { pinterestVideoSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

// Cari video di Pinterest dan kirim hasil video teratasnya. Wajib jalur
// pencarian scope 'videos' (pinterestVideoSearch): pencarian pin biasa
// tidak pernah memuat data video (terverifikasi dari VM 2026-11-06).
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

export const test = { input: '.pinvid kucing', expect: /PINTEREST VIDEO[\s\S]*pinterest\.com\/pin\// }

export async function handler(ctx, { search = pinterestVideoSearch, download = downloadBuffer } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('pinvid.needQuery'))
  let result
  try {
    result = await search(q, { limit: 50 })
  } catch (err) {
    return ctx.reply(ctx.t('pinvid.failed', { message: err.message }))
  }
  // pinterestVideoSearch membalas envelope { results } berisi pin yang
  // punya video MP4 progresif (minoritas hasil; mayoritas hanya HLS),
  // jadi limit besar dan beberapa kandidat dicoba bergantian.
  const videos = (result?.results || []).filter((p) => p.video)
  if (!videos.length) return ctx.reply(ctx.t('pinvid.notFound'))
  let lastErr = null
  for (const pin of videos.slice(0, 5)) {
    try {
      const { buffer } = await download(pin.video, { maxBytes: MAX_VIDEO_BYTES, timeout: 60000 })
      await sendVideo(ctx, buffer, {
        caption: ctx.t('pinvid.caption', { title: pin.title || q, link: pin.url || '-' }),
      })
      return undefined
    } catch (err) {
      lastErr = err
    }
  }
  return ctx.reply(ctx.t('pinvid.failed', { message: lastErr?.message || 'video gagal diunduh' }))
}
