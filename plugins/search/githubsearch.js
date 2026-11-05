// Pencarian repo GitHub: API pencarian publik GitHub tanpa kunci
// (pengecualian yang sama dengan .ghuser di DECISIONS.md).
export const config = {
  name: 'githubsearch',
  alias: ['ghsearch', 'carirepo'],
  category: 'search',
  description: { id: 'Cari repository GitHub dari kata kunci', en: 'Search GitHub repositories by keyword' },
  usage: '.githubsearch <kata kunci>',
  example: '.githubsearch whatsapp bot baileys',
  cooldown: 10,
}

export const i18n = {
  id: {
    githubsearch: {
      hint: '╭─❏ 🐙 「 *CARI REPO GITHUB* 」\n┊ Tulis kata kuncinya yaa~\n┊ Contoh: *.githubsearch whatsapp bot baileys*\n╰━━━━━━━',
      head: '╭─❏ 🐙 「 *HASIL GITHUB: {query}* 」',
      item: '┊ {n}. *{repo}* ⭐ {stars}\n┊ {desc}\n┊ {url}',
      notFound: '╭─❏ 🔍 「 *REPO TIDAK KETEMU* 」\n┊ Tidak ada repo untuk *{query}*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL CARI REPO* 」\n┊ Gagal cari di GitHub: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    githubsearch: {
      hint: '╭─❏ 🐙 「 *GITHUB REPO SEARCH* 」\n┊ Write the keyword please~\n┊ Example: *.githubsearch whatsapp bot baileys*\n╰━━━━━━━',
      head: '╭─❏ 🐙 「 *GITHUB RESULTS: {query}* 」',
      item: '┊ {n}. *{repo}* ⭐ {stars}\n┊ {desc}\n┊ {url}',
      notFound: '╭─❏ 🔍 「 *NO REPOS FOUND* 」\n┊ No repos for *{query}*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *REPO SEARCH FAILED* 」\n┊ Failed to search GitHub: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.githubsearch kana-md', expect: /.+/ }

export async function handler(ctx) {
  const query = (ctx.text || '').trim()
  if (!query) return ctx.reply(ctx.t('githubsearch.hint'))
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5&sort=stars`, {
      headers: { 'user-agent': 'kana-md', accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const items = data.items ?? []
    if (!items.length) return ctx.reply(ctx.t('githubsearch.notFound', { query, mood: ctx.say('gagal') }))
    const lines = items.map((r, i) => ctx.t('githubsearch.item', {
      n: i + 1, repo: r.full_name, stars: r.stargazers_count, desc: (r.description || '-').slice(0, 90), url: r.html_url,
    }))
    return ctx.reply(`${ctx.t('githubsearch.head', { query })}\n${lines.join('\n')}\n╰━━━━━━━`)
  } catch (err) {
    return ctx.reply(ctx.t('githubsearch.fail', { error: err.message }))
  }
}
