
export const config = {
  name: "github",
  alias: ["gituser", "githubstalk", "ghstalk"],
  category: "tools",
  description: { id: "Fitur github versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD github feature, rewritten in KANA style" },
  usage: ".github",
  example: ".github",
  cooldown: 5,
}

export const i18n = {
  id: {
    "github": {
      hint: "╭─❏ 🔍 「 *GITHUB* 」\n┊ Tulis kata kunci atau nama yang mau dicari dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.github kata kunci*\n╰━━━━━━━",
      body: "╭─❏ 🔍 「 *{title}* 」\n┊ {text}\n┊ ꜱᴜᴍʙᴇʀ: {url}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, hasil untuk *{q}* tidak ketemu di sumber publik~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencariannya gagal: *{message}*\n┊ Sumber publiknya lagi bermasalah, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "github": {
      hint: "╭─❏ 🔍 「 *GITHUB* 」\n┊ Write the keyword or name to look up first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.github keyword*\n╰━━━━━━━",
      body: "╭─❏ 🔍 「 *{title}* 」\n┊ {text}\n┊ ꜱᴏᴜʀᴄᴇ: {url}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no public result for *{q}*~\n┊ Try another keyword~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SEARCH FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ The public source is having trouble, try again later~\n╰━━━━━━━",
    },
  },
}

const KIND = "github"
export const test = { input: '.github OmmniDevv', expect: /Followers: .+\| Repo publik: \d+/ }
async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'KANA-Bot' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/<[^>]+>/g, '')
    .trim()
}

// Profil GitHub diambil dari halaman profil publik github.com, BUKAN
// api.github.com: kuota API tanpa token dari IP VM habis dan membalas
// HTTP 403 (kasus live .githubstalk 2026-11-06, akar yang sama dengan
// gitclone lama). Halaman profil memuat nama, bio, jumlah pengikut,
// mengikuti, dan repo publik. Tanggal gabung tidak tampil di halaman
// profil, jadi baris itu memang tidak dibuat (tidak dikarang).
export function parseGithubProfile(html, login) {
  const src = String(html || '')
  const nick = src.match(/<span class="p-nickname vcard-username[^"]*" itemprop="additionalName">\s*([^<]+?)\s*<\/span>/)
  if (!nick) return null
  const name = src.match(/<span class="p-name vcard-fullname[^"]*" itemprop="name">\s*([^<]+?)\s*<\/span>/)?.[1]
  const bio = src.match(/data-bio-text="([^"]*)"/)?.[1]
  const repos = src.match(/Repositories\s*<span title="([\d,]+)"[^>]*class="Counter">/)?.[1]
  const countFor = (label) => {
    const labelled = src.match(new RegExp('<span class="text-bold[^"]*">\\s*([\\d.,]+[kKmM]?)\\s*</span>\\s*' + label))
    if (labelled) return labelled[1]
    const anchor = src.indexOf('?tab=' + label)
    if (anchor >= 0) {
      const span = src.slice(anchor, anchor + 3000).match(/<span class="text-bold[^"]*">\s*([\d.,]+[kKmM]?)\s*<\/span>/)
      if (span) return span[1]
    }
    return '0'
  }
  return {
    login: decodeEntities(nick[1]) || login,
    name: name ? decodeEntities(name) : '',
    bio: bio ? decodeEntities(bio) : '',
    followers: countFor('followers'),
    following: countFor('following'),
    repos: repos || '0',
    url: 'https://github.com/' + encodeURIComponent(login),
  }
}

async function fetchGithubProfile(login) {
  const res = await fetch('https://github.com/' + encodeURIComponent(login), {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 'accept-language': 'en-US,en;q=0.9' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('GitHub HTTP ' + res.status)
  return parseGithubProfile(await res.text(), login)
}
export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('github.hint'))
  try {
    if (KIND === 'github') {
      const u = await fetchGithubProfile(q.replace(/^@/, ''))
      if (!u) return ctx.reply(ctx.t('github.notfound', { q }))
      const body = ctx.t('github.body', { title: u.login, text: [u.name || '-', u.bio || '-', 'Followers: ' + u.followers + ' | Mengikuti: ' + u.following + ' | Repo publik: ' + u.repos].join('\n┊ '), url: u.url })
      return ctx.reply(body)
    }
    if (KIND === 'npm') {
      const u = await fetchJson('https://registry.npmjs.org/' + encodeURIComponent(q))
      const latest = u['dist-tags']?.latest || '-'
      const ver = u.versions?.[latest] || {}
      const body = ctx.t('github.body', { title: u.name, text: [ver.description || u.description || '-', 'Versi terbaru: ' + latest, 'Lisensi: ' + (ver.license || '-'), 'Author: ' + (typeof ver.author === 'object' ? ver.author?.name || '-' : ver.author || '-')].join('\n┊ '), url: 'https://www.npmjs.com/package/' + encodeURIComponent(q) })
      return ctx.reply(body)
    }
    if (KIND === 'roblox') {
      const u = await fetchJson('https://users.roblox.com/v1/users/search?keyword=' + encodeURIComponent(q) + '&limit=10')
      const rows = (u.data || []).slice(0, 5)
      if (!rows.length) return ctx.reply(ctx.t('github.notfound', { q }))
      const text = rows.map((r, i) => (i + 1) + '. *' + r.name + '* (@' + r.displayName + ', id ' + r.id + ')').join('\n┊ ')
      return ctx.reply(ctx.t('github.body', { title: q, text, url: 'https://www.roblox.com/users' }))
    }
    if (KIND === 'mc') {
      const u = await fetchJson('https://api.mcsrvstat.us/3/' + encodeURIComponent(q))
      if (!u || u.online === undefined && !u.ip) return ctx.reply(ctx.t('github.notfound', { q }))
      const text = ['Status: ' + (u.online ? 'ONLINE' : 'offline'), 'IP: ' + (u.ip || q), 'Pemain: ' + (u.players?.online ?? 0) + '/' + (u.players?.max ?? 0), 'Versi: ' + (u.version || '-')].join('\n┊ ')
      return ctx.reply(ctx.t('github.body', { title: q, text, url: 'https://mcsrvstat.us' }))
    }
    // Default: Wikipedia ringkasan dulu, lalu DuckDuckGo Instant Answer.
    try {
      const w = await fetchJson('https://id.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(q.replace(/\s+/g, '_')))
      if (w && w.extract) {
        return ctx.reply(ctx.t('github.body', { title: w.title || q, text: String(w.extract).slice(0, 900), url: w.content_urls?.desktop?.page || 'https://id.wikipedia.org' }))
      }
    } catch {}
    const d = await fetchJson('https://api.duckduckgo.com/?q=' + encodeURIComponent(q) + '&format=json&no_html=1&skip_disambig=1')
    const text = d.AbstractText || (d.RelatedTopics || []).map((t) => t.Text).filter(Boolean).slice(0, 3).join('\n┊ ')
    if (!text) return ctx.reply(ctx.t('github.notfound', { q }))
    return ctx.reply(ctx.t('github.body', { title: d.Heading || q, text: String(text).slice(0, 900), url: d.AbstractURL || 'https://duckduckgo.com' }))
  } catch (err) {
    return ctx.reply(ctx.t('github.fail', { message: err.message }))
  }
}
