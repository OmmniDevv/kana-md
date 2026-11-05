import { sendButtons } from '../../src/ui/buttons.js'
import { getRandomPuisi } from '../../src/scrapers/search/puisi.js'

// Puisi: ambil puisi Indonesia beneran dari PuisiPendek.net (judul + isi
// + tautan sumber), bukan lagi kumpulan teks statis lokal. API lama
// Neoxr tidak dipakai karena memakai API key hardcoded bot lain.
export const config = {
  name: 'puisi',
  alias: ['puisiku', 'sajak'],
  category: 'fun',
  description: { id: 'Kirim satu puisi Indonesia dari PuisiPendek.net', en: 'Send one Indonesian poem from PuisiPendek.net' },
  usage: '.puisi',
  example: '.puisi',
  cooldown: 3,
}

export const i18n = {
  id: {
    puisi: {
      title: 'Puisi Untukmu',
      body: '╭─❏ 📜 「 *{title}* 」\n┊\n{item}\n\n┊ Sumber: {url}\n╰━━━━━━━ {mood}',
      fail: '╭─❏ 💦 「 *PUISI GAGAL* 」\n┊ Mouu, puisinya gagal diambil dari sumbernya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Puisi Lain',
    },
  },
  en: {
    puisi: {
      title: 'A Poem For You',
      body: '╭─❏ 📜 「 *{title}* 」\n┊\n{item}\n\n┊ Source: {url}\n╰━━━━━━━ {mood}',
      fail: '╭─❏ 💦 「 *POEM FAILED* 」\n┊ Mouu, the poem failed to load from its source: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Poem',
    },
  },
}

export const test = { input: '.puisi', expect: /puisipendek|sumber:|source:/i }

export function formatPuisi(t, poem, mood) {
  return t('puisi.body', { title: poem.title, item: poem.text, url: poem.url, mood })
}

export async function handler(ctx) {
  let poem
  try {
    poem = await getRandomPuisi()
  } catch (err) {
    return ctx.reply(ctx.t('puisi.fail', { message: err.message }))
  }
  const body = formatPuisi(ctx.t, poem, ctx.say('senang'))
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('puisi.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('puisi.btnAgain'), id: '.puisi' }],
    textFallback: body,
  })
}
