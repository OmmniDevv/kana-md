// Pencarian aplikasi Play Store: halaman hasil pencarian publik
// play.google.com di-scrape untuk nama, pengembang, dan ratingnya.
import { downloadBuffer } from '../../src/scrapers/runner.js'

export const config = {
  name: 'playstore',
  alias: ['pssearch'],
  category: 'search',
  description: { id: 'Cari aplikasi di Google Play Store', en: 'Search apps on the Google Play Store' },
  usage: '.playstore <nama aplikasi>',
  example: '.playstore whatsapp',
  cooldown: 10,
}

export const i18n = {
  id: {
    playstore: {
      hint: '╭─❏ 🛍️ 「 *CARI APLIKASI* 」\n┊ Tulis nama aplikasinya yaa~\n┊ Contoh: *.playstore whatsapp*\n╰━━━━━━━',
      head: '╭─❏ 🛍️ 「 *HASIL PLAY STORE: {query}* 」',
      item: '┊ {n}. *{title}*\n┊ 👨‍💻 {dev} · ⭐ *{rating}*\n┊ {url}',
      itemBare: '┊ {n}. *{title}*\n┊ {url}',
      itemRate: '┊ {n}. *{title}*\n┊ ⭐ *{rating}*\n┊ {url}',
      notFound: '╭─❏ 🔍 「 *APLIKASI TIDAK KETEMU* 」\n┊ Tidak ada hasil untuk *{query}* di Play Store. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL CARI APLIKASI* 」\n┊ Gagal cari di Play Store: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    playstore: {
      hint: '╭─❏ 🛍️ 「 *APP SEARCH* 」\n┊ Write the app name please~\n┊ Example: *.playstore whatsapp*\n╰━━━━━━━',
      head: '╭─❏ 🛍️ 「 *PLAY STORE RESULTS: {query}* 」',
      item: '┊ {n}. *{title}*\n┊ 👨‍💻 {dev} · ⭐ *{rating}*\n┊ {url}',
      itemBare: '┊ {n}. *{title}*\n┊ {url}',
      itemRate: '┊ {n}. *{title}*\n┊ ⭐ *{rating}*\n┊ {url}',
      notFound: '╭─❏ 🔍 「 *APP NOT FOUND* 」\n┊ No Play Store results for *{query}*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *APP SEARCH FAILED* 」\n┊ Failed to search the Play Store: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.playstore', expect: /aplikasi|app name/i }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

export function parsePlayStore(html, limit = 5) {
  const apps = []
  const seen = new Set()
  const push = (app) => {
    if (seen.has(app.id) || apps.length >= limit) return
    seen.add(app.id)
    apps.push(app)
  }
  const anchorRe = /href="\/store\/apps\/details\?id=([a-zA-Z0-9._]+)" aria-label="([^"]{2,90})"/g
  let m
  while ((m = anchorRe.exec(html))) {
    const segment = html.slice(m.index, m.index + 2600)
    const dev = segment.match(/<div class="LbQbAe">([^<]{1,60})<\/div>/)?.[1]?.trim() ?? ''
    const ratingMatch = segment.match(/(?:Diberi rating|Rated)\s+([0-5][.,]\d)/)
    push({
      id: m[1],
      title: m[2].trim(),
      dev,
      rating: ratingMatch ? ratingMatch[1].replace(',', '.') : '',
      url: `https://play.google.com/store/apps/details?id=${m[1]}`,
    })
  }
  // Hasil lain hidup di blob data AF_initDataCallback: potong per paket,
  // di dalam potongannya ada judul dan rating.
  if (apps.length < limit) {
    const chunkRe = /\[\[\[\\?"([a-zA-Z0-9._]+)\\?",7\]/g
    const chunks = []
    let c
    while ((c = chunkRe.exec(html))) chunks.push({ id: c[1], at: c.index })
    for (let i = 0; i < chunks.length && apps.length < limit; i++) {
      const segment = html.slice(chunks[i].at, chunks[i].at + 6000)
      const pair = segment.match(/\\?\],\\?"([^"\\]{2,80})\\?",\[\\?"([0-5][.,]\d)\\?",\d/)
      if (!pair) continue
      push({
        id: chunks[i].id,
        title: pair[1].trim(),
        dev: '',
        rating: pair[2].replace(',', '.'),
        url: `https://play.google.com/store/apps/details?id=${chunks[i].id}`,
      })
    }
  }
  return apps
}

export async function handler(ctx) {
  const query = (ctx.text || '').trim()
  if (!query) return ctx.reply(ctx.t('playstore.hint'))
  try {
    const url = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps&hl=id`
    const page = await downloadBuffer(url, { maxBytes: 4 * 1024 * 1024, headers: { 'user-agent': UA } })
    const apps = parsePlayStore(page.buffer.toString('utf8'))
    if (!apps.length) return ctx.reply(ctx.t('playstore.notFound', { query, mood: ctx.say('gagal') }))
    const lines = apps.map((a, i) => {
      if (a.dev) return ctx.t('playstore.item', { n: i + 1, title: a.title, dev: a.dev, rating: a.rating || '-', url: a.url })
      if (a.rating) return ctx.t('playstore.itemRate', { n: i + 1, title: a.title, rating: a.rating, url: a.url })
      return ctx.t('playstore.itemBare', { n: i + 1, title: a.title, url: a.url })
    })
    return ctx.reply(`${ctx.t('playstore.head', { query })}\n${lines.join('\n')}\n╰━━━━━━━`)
  } catch (err) {
    return ctx.reply(ctx.t('playstore.fail', { error: err.message }))
  }
}
