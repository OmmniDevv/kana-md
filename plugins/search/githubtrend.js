// Repo yang lagi trending di GitHub hari ini: halaman publik
// github.com/trending di-scrape (sesuai aturan riset repo GitHub).
import { downloadBuffer } from '../../src/scrapers/runner.js'

export const config = {
  name: 'githubtrend',
  alias: ['ghtrend', 'trendingrepo'],
  category: 'search',
  description: { id: 'Repo GitHub yang sedang trending hari ini', en: 'GitHub repositories trending today' },
  usage: '.githubtrend',
  example: '.githubtrend',
  cooldown: 15,
}

export const i18n = {
  id: {
    githubtrend: {
      head: '╭─❏ 🔥 「 *REPO GITHUB TRENDING HARI INI* 」',
      item: '┊ {n}. *{repo}* ⭐ {stars} hari ini{lang}\n┊ {desc}\n┊ {url}',
      fail: '╭─❏ 😖 「 *GAGAL AMBIL TRENDING* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    githubtrend: {
      head: '╭─❏ 🔥 「 *GITHUB TRENDING REPOS TODAY* 」',
      item: '┊ {n}. *{repo}* ⭐ {stars} today{lang}\n┊ {desc}\n┊ {url}',
      fail: '╭─❏ 😖 「 *FAILED TO FETCH TRENDING* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.githubtrend', expect: /trending/i }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

export function parseTrending(html, limit = 7) {
  const out = []
  const articles = html.match(/<article class="Box-row">[\s\S]*?<\/article>/g) ?? []
  for (const art of articles.slice(0, limit)) {
    const repo = art.match(/href="\/([^"/]+\/[^"/]+)" data-view-component/)?.[1]
    if (!repo) continue
    const desc = (art.match(/<p[^>]*color-fg-muted[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '')
      .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 110)
    const stars = art.match(/([\d,]+)\s*stars today/)?.[1] ?? '?'
    const lang = art.match(/itemprop="programmingLanguage">([^<]+)</)?.[1] ?? ''
    out.push({ repo, desc, stars, lang, url: `https://github.com/${repo}` })
  }
  return out
}

export async function handler(ctx) {
  try {
    const page = await downloadBuffer('https://github.com/trending?since=daily', { maxBytes: 4 * 1024 * 1024, headers: { 'user-agent': UA } })
    const repos = parseTrending(page.buffer.toString('utf8'))
    if (!repos.length) throw new Error('halaman trending tidak terbaca')
    const lines = repos.map((r, i) => ctx.t('githubtrend.item', {
      n: i + 1, repo: r.repo, stars: r.stars, lang: r.lang ? ` · ${r.lang}` : '', desc: r.desc || '-', url: r.url,
    }))
    return ctx.reply(`${ctx.t('githubtrend.head')}\n${lines.join('\n')}\n╰━━━━━━━`)
  } catch (err) {
    return ctx.reply(ctx.t('githubtrend.fail', { error: err.message }))
  }
}
