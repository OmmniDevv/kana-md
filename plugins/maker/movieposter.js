import { moviePosterCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'movieposter',
  alias: ['posterfilm'],
  category: 'maker',
  description: { id: 'Poster film fiktif dari judul yang kamu tulis, genre dan tagline acak', en: 'Fictional movie poster from your title, with a random genre and tagline' },
  usage: '.movieposter <judul film>',
  example: '.movieposter Kana Menyelamatkan Kota',
  cooldown: 5,
}

const GENRES = ['Aksi Neo-Noir', 'Drama Fantasi', 'Komedi Romantis', 'Horor Psikologis', 'Petualangan Luar Angkasa', 'Thriller Kriminal', 'Animasi Keluarga', 'Epik Sejarah']
const TAGLINES = [
  'Satu pilihan mengubah segalanya.',
  'Tidak ada jalan pulang selain maju.',
  'Dunia tidak siap untuk kebenaran ini.',
  'Persahabatan diuji di titik paling gelap.',
  'Kadang pahlawan datang dari tempat yang tidak terduga.',
  'Semua berawal dari satu malam yang aneh.',
]

export const i18n = {
  id: { movieposter: { hint: '╭─❏ 🎬 「 *BUTUH JUDUL FILM* 」\n┊ Tulis judul filmnya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.movieposter Kana Menyelamatkan Kota*\n╰━━━━━━━', caption: '╭─❏ 🎬 「 *POSTER FILM JADI* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ɢᴇɴʀᴇ: *{genre}* 🎬\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN POSTER* 」\n┊ Mouu, gagal bikin poster film: *{error}*~\n╰━━━━━━━' } },
  en: { movieposter: { hint: '╭─❏ 🎬 「 *MOVIE TITLE NEEDED* 」\n┊ Write the movie title please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.movieposter Kana Saves the City*\n╰━━━━━━━', caption: '╭─❏ 🎬 「 *MOVIE POSTER READY* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ɢᴇɴʀᴇ: *{genre}* 🎬\n╰━━━━━━━', fail: '╭─❏ 💦 「 *POSTER FAILED* 」\n┊ Mouu, failed to make the movie poster: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.movieposter naruto', expect: /.+/ }

export async function handler(ctx) {
  const title = (ctx.text || '').trim().slice(0, 80)
  if (!title) return ctx.reply(ctx.t('movieposter.hint'))
  const genre = GENRES[Math.floor(Math.random() * GENRES.length)]
  const tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)]
  const year = new Date().getFullYear()
  try {
    const buffer = await moviePosterCard({ title, genre, tagline, year })
    return sendImage(ctx, buffer, { caption: ctx.t('movieposter.caption', { title, genre }) })
  } catch (err) {
    return ctx.reply(ctx.t('movieposter.fail', { error: err.message }))
  }
}
