import { getRandomMeme } from '../../src/scrapers/random/meme.js'
import { sendImage } from '../../src/ui/media.js'

// Lahelu: API cuki Elaina untuk lahelu sudah mati (401) dan tidak ada
// endpoint publik lahelu lain yang terverifikasi dari VM ini, jadi
// meme diambil dari meme-api.com/gimme dan sumbernya disebutkan
// jujur di caption. Hanya meme non-NSFW yang dikirim, dan berkasnya
// divalidasi magic bytes di scraper sebelum sampai ke sini.
export const config = {
  name: 'lahelu',
  alias: ['memeindo'],
  category: 'random',
  description: { id: 'Meme acak aman dari meme-api (pengganti lahelu)', en: 'Random safe meme from meme-api (lahelu replacement)' },
  usage: '.lahelu',
  example: '.lahelu',
  cooldown: 5,
}

export const i18n = {
  id: {
    lahelu: {
      caption: '╭─❏ 😂 「 *MEME ACAK* 」\n┊ {title}\n┊ Subreddit: r/{subreddit}\n┊ Sumber: meme-api.com (pengganti lahelu, API lamanya sudah mati)\n╰━━━━━━━',
      captionNoSub: '╭─❏ 😂 「 *MEME ACAK* 」\n┊ {title}\n┊ Sumber: meme-api.com (pengganti lahelu, API lamanya sudah mati)\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *MEME GAGAL* 」\n┊ Mouu, memenya gagal diambil: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
    },
  },
  en: {
    lahelu: {
      caption: '╭─❏ 😂 「 *RANDOM MEME* 」\n┊ {title}\n┊ Subreddit: r/{subreddit}\n┊ Source: meme-api.com (lahelu replacement, its old API is dead)\n╰━━━━━━━',
      captionNoSub: '╭─❏ 😂 「 *RANDOM MEME* 」\n┊ {title}\n┊ Source: meme-api.com (lahelu replacement, its old API is dead)\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *MEME FAILED* 」\n┊ Mouu, the meme failed to load: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.lahelu', expect: /meme acak|random meme/i }

export function formatMemeCaption(t, meme) {
  return meme.subreddit
    ? t('lahelu.caption', { title: meme.title, subreddit: meme.subreddit })
    : t('lahelu.captionNoSub', { title: meme.title })
}

export async function handler(ctx, { fetchMeme = getRandomMeme } = {}) {
  try {
    const meme = await fetchMeme()
    return await sendImage(ctx, meme.buffer, { caption: formatMemeCaption(ctx.t, meme) })
  } catch (err) {
    return ctx.reply(ctx.t('lahelu.fail', { message: err.message }))
  }
}
