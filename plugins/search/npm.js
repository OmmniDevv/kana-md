// Cari paket npm dari registry resmi npm (API pencarian publik tanpa
// kunci, pengecualian setara GitHub publik di DECISIONS.md).
export const config = {
  name: 'npm',
  alias: ['npmsearch', 'carinpm'],
  category: 'search',
  description: { id: 'Cari paket di registry npm', en: 'Search packages on the npm registry' },
  usage: '.npm <kata kunci>',
  example: '.npm express',
  cooldown: 10,
}

export const i18n = {
  id: {
    npm: {
      hint: '╭─❏ 📦 「 *CARI PAKET NPM* 」\n┊ Tulis kata kuncinya yaa~\n┊ Contoh: *.npm express*\n╰━━━━━━━',
      head: '╭─❏ 📦 「 *HASIL NPM: {query}* 」',
      item: '┊ {n}. *{name}@{version}*\n┊ {desc}\n┊ {url}',
      notFound: '╭─❏ 🔍 「 *PAKET TIDAK KETEMU* 」\n┊ Tidak ada paket untuk *{query}*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL CARI PAKET* 」\n┊ Gagal cari di npm: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    npm: {
      hint: '╭─❏ 📦 「 *NPM PACKAGE SEARCH* 」\n┊ Write the keyword please~\n┊ Example: *.npm express*\n╰━━━━━━━',
      head: '╭─❏ 📦 「 *NPM RESULTS: {query}* 」',
      item: '┊ {n}. *{name}@{version}*\n┊ {desc}\n┊ {url}',
      notFound: '╭─❏ 🔍 「 *NO PACKAGES FOUND* 」\n┊ No packages for *{query}*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *PACKAGE SEARCH FAILED* 」\n┊ Failed to search npm: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.npm', expect: /kata kunci|keyword/i }

export async function handler(ctx) {
  const query = (ctx.text || '').trim()
  if (!query) return ctx.reply(ctx.t('npm.hint'))
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const objects = data.objects ?? []
    if (!objects.length) return ctx.reply(ctx.t('npm.notFound', { query, mood: ctx.say('gagal') }))
    const lines = objects.map((o, i) => ctx.t('npm.item', {
      n: i + 1,
      name: o.package.name,
      version: o.package.version,
      desc: (o.package.description || '').slice(0, 90),
      url: o.package.links?.npm ?? `https://www.npmjs.com/package/${o.package.name}`,
    }))
    return ctx.reply(`${ctx.t('npm.head', { query })}\n${lines.join('\n')}\n╰━━━━━━━`)
  } catch (err) {
    return ctx.reply(ctx.t('npm.fail', { error: err.message }))
  }
}
