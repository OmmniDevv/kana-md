
export const config = {
  name: "melolo",
  alias: [],
  category: "search",
  description: { id: "Fitur melolo versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD melolo feature, rewritten in KANA style" },
  usage: ".melolo",
  example: ".melolo",
  cooldown: 5,
}

export const i18n = {
  id: {
    "melolo": {
      hint: "╭─❏ 🔍 「 *MELOLO* 」\n┊ Tulis kata kunci atau nama yang mau dicari dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.melolo kata kunci*\n╰━━━━━━━",
      body: "╭─❏ 🔍 「 *{title}* 」\n┊ {text}\n┊ ꜱᴜᴍʙᴇʀ: {url}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, hasil untuk *{q}* tidak ketemu di sumber publik~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencariannya gagal: *{message}*\n┊ Sumber publiknya lagi bermasalah, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "melolo": {
      hint: "╭─❏ 🔍 「 *MELOLO* 」\n┊ Write the keyword or name to look up first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.melolo keyword*\n╰━━━━━━━",
      body: "╭─❏ 🔍 「 *{title}* 」\n┊ {text}\n┊ ꜱᴏᴜʀᴄᴇ: {url}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no public result for *{q}*~\n┊ Try another keyword~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SEARCH FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ The public source is having trouble, try again later~\n╰━━━━━━━",
    },
  },
}

const KIND = "wiki"
export const test = { input: '.melolo', expect: /tulis|write/i }
async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'KANA-Bot' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}
export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('melolo.hint'))
  try {
    if (KIND === 'github') {
      const u = await fetchJson('https://api.github.com/users/' + encodeURIComponent(q.replace(/^@/, '')))
      const body = ctx.t('melolo.body', { title: u.login, text: [u.name || '-', u.bio || '-', 'Followers: ' + (u.followers ?? 0) + ' | Repo publik: ' + (u.public_repos ?? 0), 'Dibuat: ' + String(u.created_at || '').slice(0, 10)].join('\n┊ '), url: u.html_url })
      return ctx.reply(body)
    }
    if (KIND === 'npm') {
      const u = await fetchJson('https://registry.npmjs.org/' + encodeURIComponent(q))
      const latest = u['dist-tags']?.latest || '-'
      const ver = u.versions?.[latest] || {}
      const body = ctx.t('melolo.body', { title: u.name, text: [ver.description || u.description || '-', 'Versi terbaru: ' + latest, 'Lisensi: ' + (ver.license || '-'), 'Author: ' + (typeof ver.author === 'object' ? ver.author?.name || '-' : ver.author || '-')].join('\n┊ '), url: 'https://www.npmjs.com/package/' + encodeURIComponent(q) })
      return ctx.reply(body)
    }
    if (KIND === 'roblox') {
      const u = await fetchJson('https://users.roblox.com/v1/users/search?keyword=' + encodeURIComponent(q) + '&limit=10')
      const rows = (u.data || []).slice(0, 5)
      if (!rows.length) return ctx.reply(ctx.t('melolo.notfound', { q }))
      const text = rows.map((r, i) => (i + 1) + '. *' + r.name + '* (@' + r.displayName + ', id ' + r.id + ')').join('\n┊ ')
      return ctx.reply(ctx.t('melolo.body', { title: q, text, url: 'https://www.roblox.com/users' }))
    }
    if (KIND === 'mc') {
      const u = await fetchJson('https://api.mcsrvstat.us/3/' + encodeURIComponent(q))
      if (!u || u.online === undefined && !u.ip) return ctx.reply(ctx.t('melolo.notfound', { q }))
      const text = ['Status: ' + (u.online ? 'ONLINE' : 'offline'), 'IP: ' + (u.ip || q), 'Pemain: ' + (u.players?.online ?? 0) + '/' + (u.players?.max ?? 0), 'Versi: ' + (u.version || '-')].join('\n┊ ')
      return ctx.reply(ctx.t('melolo.body', { title: q, text, url: 'https://mcsrvstat.us' }))
    }
    // Default: Wikipedia ringkasan dulu, lalu DuckDuckGo Instant Answer.
    try {
      const w = await fetchJson('https://id.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(q.replace(/\s+/g, '_')))
      if (w && w.extract) {
        return ctx.reply(ctx.t('melolo.body', { title: w.title || q, text: String(w.extract).slice(0, 900), url: w.content_urls?.desktop?.page || 'https://id.wikipedia.org' }))
      }
    } catch {}
    const d = await fetchJson('https://api.duckduckgo.com/?q=' + encodeURIComponent(q) + '&format=json&no_html=1&skip_disambig=1')
    const text = d.AbstractText || (d.RelatedTopics || []).map((t) => t.Text).filter(Boolean).slice(0, 3).join('\n┊ ')
    if (!text) return ctx.reply(ctx.t('melolo.notfound', { q }))
    return ctx.reply(ctx.t('melolo.body', { title: d.Heading || q, text: String(text).slice(0, 900), url: d.AbstractURL || 'https://duckduckgo.com' }))
  } catch (err) {
    return ctx.reply(ctx.t('melolo.fail', { message: err.message }))
  }
}
