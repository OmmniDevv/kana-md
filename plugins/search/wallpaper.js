import { searchWallpaper, downloadWallpaperImage } from '../../src/scrapers/search/wallpaper.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'wallpaper',
  alias: ['wp'],
  category: 'search',
  description: { id: 'Cari wallpaper dari wallpaperflare.com', en: 'Search wallpapers from wallpaperflare.com' },
  usage: '.wallpaper <kata kunci>',
  example: '.wallpaper anime',
  cooldown: 10,
}

export const i18n = {
  id: {
    wallpaper: {
      needQuery: '╭─❏ 🖼️ 「 *TULIS KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.wallpaper anime*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA cariin wallpaper *{query}* dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL CARI WALLPAPER* 」\n┊ Mouu, gagal cari wallpapernya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *WALLPAPER* 」\n┊ ᴋᴀᴛᴀ ᴋᴜɴᴄɪ: *{query}*\n┊ ᴅɪᴛᴇᴍᴜᴋᴀɴ *{total}* gambar di wallpaperflare.com, ini yang pertama~\n╰━━━━━━━',
    },
  },
  en: {
    wallpaper: {
      needQuery: '╭─❏ 🖼️ 「 *WRITE THE KEYWORD* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.wallpaper anime*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is looking for *{query}* wallpapers... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *WALLPAPER SEARCH FAILED* 」\n┊ Mouu, failed to search wallpapers: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *WALLPAPER* 」\n┊ ᴋᴇʏᴡᴏʀᴅ: *{query}*\n┊ Found *{total}* images on wallpaperflare.com, here is the first one~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.wallpaper anime', expect: /wallpaper/i }

export async function handler(ctx) {
  const query = (ctx.text || '').trim()
  if (!query) return ctx.reply(ctx.t('wallpaper.needQuery'))
  await ctx.reply(ctx.t('wallpaper.working', { query, mood: ctx.say('mikir') }))
  try {
    const found = await searchWallpaper(query, { limit: 10 })
    const buffer = await downloadWallpaperImage(found.results[0])
    await sendImage(ctx, buffer, {
      caption: ctx.t('wallpaper.caption', { query: found.query, total: found.total }),
    })
  } catch (err) {
    return ctx.reply(ctx.t('wallpaper.failed', { message: err.message }))
  }
}
