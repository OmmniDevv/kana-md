import { getRandomMisteri } from '../../src/scrapers/search/misteri.js'
import { sendImage } from '../../src/ui/media.js'

// Misteri: artikel horor/misteri acak dari sumber hidup (IDN Times,
// halaman tag kisah-horor) lengkap dengan gambar sampul, judul, dan
// tautan baca, mengikuti mekanik misteri Elaina (artikel acak +
// gambar). Sumber asli Elaina rumahmisteri.com tidak bisa dihubungi
// dari VM ini, buktinya dicatat di src/scrapers/search/misteri.js.
export const config = {
  name: 'misteri',
  alias: ['ceritamisteri', 'horor'],
  category: 'fun',
  description: { id: 'Artikel misteri dan horor acak dengan gambar dari IDN Times', en: 'Random mystery and horror article with image from IDN Times' },
  usage: '.misteri',
  example: '.misteri',
  cooldown: 5,
}

export const i18n = {
  id: {
    misteri: {
      caption: '╭─❏ 🌙 「 *MISTERI* 」\n┊ *{title}*\n┊\n┊ Baca selengkapnya:\n┊ {link}\n┊\n┊ Sumber: IDN Times (tag kisah-horor)\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *MISTERI GAGAL* 」\n┊ Mouu, artikel misterinya gagal diambil: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
    },
  },
  en: {
    misteri: {
      caption: '╭─❏ 🌙 「 *MYSTERY* 」\n┊ *{title}*\n┊\n┊ Read more:\n┊ {link}\n┊\n┊ Source: IDN Times (kisah-horor tag)\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *MYSTERY FAILED* 」\n┊ Mouu, the mystery article failed to load: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.misteri', expect: /misteri|mystery|idn times/i }

export async function handler(ctx) {
  try {
    const article = await getRandomMisteri()
    const caption = ctx.t('misteri.caption', { title: article.title, link: article.link })
    return await sendImage(ctx, article.imageBuffer, { caption })
  } catch (err) {
    return ctx.reply(ctx.t('misteri.fail', { message: err.message }))
  }
}
