// Cari gist publik GitHub berdasarkan kata kunci pada deskripsi atau
// nama berkasnya. API gist publik GitHub tidak punya pencarian, jadi
// daftar gist publik terbaru disaring lokal di sisi bot.
export const config = {
  name: 'searchgist',
  alias: ['carigist', 'gistsearch'],
  category: 'tools',
  description: { id: 'Cari gist publik GitHub dari kata kunci', en: 'Search public GitHub gists by keyword' },
  usage: '.searchgist <kata kunci>',
  example: '.searchgist javascript',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    searchgist: {
      needQuery: '╭─❏ 🐙 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.searchgist javascript*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *GIST TIDAK KETEMU* 」\n┊ Mouu, nggak ada gist publik terbaru yang cocok sama *{q}*~\n┊ ᴄᴀʀɪ ʟᴀɴɢꜱᴜɴɢ ᴅɪ ɢɪꜱᴛ.ɢɪᴛʜᴜʙ.ᴄᴏᴍ/ᴅɪꜱᴄᴏᴠᴇʀ ʙᴜᴀᴛ ʜᴀꜱɪʟ ʟᴇʙɪʜ ʟᴜᴀꜱ ʏᴀ.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian gistnya gagal: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 🐙 「 *GIST: {q}* 」',
      item: '┊ {n}. *{desc}*\n┊ 👤 {owner} | 📄 {files}\n┊ {url}',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    searchgist: {
      needQuery: '╭─❏ 🐙 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.searchgist javascript*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO GISTS FOUND* 」\n┊ Mouu, no recent public gists match *{q}*~\n┊ ꜱᴇᴀʀᴄʜ ᴅɪʀᴇᴄᴛʟʏ ᴀᴛ ɢɪꜱᴛ.ɢɪᴛʜᴜʙ.ᴄᴏᴍ/ᴅɪꜱᴄᴏᴠᴇʀ ꜰᴏʀ ʙʀᴏᴀᴅᴇʀ ʀᴇꜱᴜʟᴛꜱ.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, the gist search failed: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 🐙 「 *GISTS: {q}* 」',
      item: '┊ {n}. *{desc}*\n┊ 👤 {owner} | 📄 {files}\n┊ {url}',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.searchgist javascript', expect: /GIST/ }

// Saring daftar gist publik dengan kata kunci.
export function filterGists(gists, query, limit = 5) {
  const q = String(query || '').toLowerCase()
  if (!Array.isArray(gists) || !q) return []
  return gists.filter((g) => {
    const desc = String(g.description || '').toLowerCase()
    const files = Object.keys(g.files || {}).join(' ').toLowerCase()
    return desc.includes(q) || files.includes(q)
  }).slice(0, limit).map((g) => ({
    desc: (g.description || Object.keys(g.files || {})[0] || 'gist').slice(0, 80),
    owner: g.owner?.login || '-',
    files: Object.keys(g.files || {}).slice(0, 3).join(', ') || '-',
    url: g.html_url,
  }))
}

async function fetchPublicGists() {
  const res = await fetch('https://api.github.com/gists/public?per_page=100', {
    signal: AbortSignal.timeout(20000),
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'KANA-Bot' },
  })
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { fetchGists = fetchPublicGists } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('searchgist.needQuery'))
  let results
  try {
    results = filterGists(await fetchGists(), q)
  } catch (err) {
    return ctx.reply(ctx.t('searchgist.failed', { message: err.message }))
  }
  if (!results.length) return ctx.reply(ctx.t('searchgist.notFound', { q }))
  const lines = [ctx.t('searchgist.header', { q })]
  results.forEach((r, i) => lines.push(ctx.t('searchgist.item', { n: i + 1, ...r })))
  lines.push(ctx.t('searchgist.footer'))
  return ctx.reply(lines.join('\n'))
}
