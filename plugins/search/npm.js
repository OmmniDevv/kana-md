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
      hint: 'Tulis kata kuncinya yaa~ Contoh: .npm express',
      head: '📦 HASIL NPM: {query}',
      item: '{n}. {name}@{version}\n   {desc}\n   {url}',
      notFound: 'Tidak ada paket untuk "{query}". {mood}',
      fail: 'Gagal cari di npm: {error}',
    },
  },
  en: {
    npm: {
      hint: 'Write the keyword please~ Example: .npm express',
      head: '📦 NPM RESULTS: {query}',
      item: '{n}. {name}@{version}\n   {desc}\n   {url}',
      notFound: 'No packages for "{query}". {mood}',
      fail: 'Failed to search npm: {error}',
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
    return ctx.reply(`${ctx.t('npm.head', { query })}\n\n${lines.join('\n\n')}`)
  } catch (err) {
    return ctx.reply(ctx.t('npm.fail', { error: err.message }))
  }
}
