// Pindai ringkasan repo GitHub publik lewat API resmi GitHub:
// bintang, fork, isu, bahasa utama, lisensi, ukuran, aktivitas.
export const config = {
  name: 'scanrepo',
  alias: ['reposcan', 'scanrepository'],
  category: 'tools',
  description: { id: 'Pindai info repo GitHub: bintang, fork, bahasa, lisensi', en: 'Scan a GitHub repo info: stars, forks, language, license' },
  usage: '.scanrepo <owner/repo>',
  example: '.scanrepo facebook/react',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    scanrepo: {
      needRepo: '╭─❏ 🐙 「 *KETIK REPONNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.scanrepo facebook/react* ᴀᴛᴀᴜ ʟɪɴᴋ ʀᴇᴘᴏɴʏᴀ.\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *REPO TIDAK KETEMU* 」\n┊ Mouu, repo *{repo}* tidak ketemu atau privat~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SCAN GAGAL* 」\n┊ Mouu, scan reponya gagal: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🐙 「 *{name}* 」\n┊ ᴏᴡɴᴇʀ: *{owner}*\n┊ ⭐ ʙɪɴᴛᴀɴɢ: *{stars}* | 🍴 ꜰᴏʀᴋ: *{forks}* | ❗ ɪꜱᴜ ᴛᴇʀʙᴜᴋᴀ: *{issues}*\n┊ 💻 ʙᴀʜᴀꜱᴀ: *{langs}*\n┊ ⚖️ ʟɪꜱᴇɴꜱɪ: *{license}* | 📦 ᴜᴋᴜʀᴀɴ: *{size}*\n┊ 🆕 ᴅɪʙᴜᴀᴛ: {created} | 🔄 ᴜᴘᴅᴀᴛᴇ: {updated}\n┊ ᴅᴇꜱᴋʀɪᴘꜱɪ: {desc}\n┊ 🔗 {url}\n╰━━━━━━━',
    },
  },
  en: {
    scanrepo: {
      needRepo: '╭─❏ 🐙 「 *TYPE THE REPO* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.scanrepo facebook/react* ᴏʀ ᴛʜᴇ ʀᴇᴘᴏ ʟɪɴᴋ.\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *REPO NOT FOUND* 」\n┊ Mouu, the repo *{repo}* was not found or is private~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SCAN FAILED* 」\n┊ Mouu, the repo scan failed: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🐙 「 *{name}* 」\n┊ ᴏᴡɴᴇʀ: *{owner}*\n┊ ⭐ ꜱᴛᴀʀꜱ: *{stars}* | 🍴 ꜰᴏʀᴋꜱ: *{forks}* | ❗ ᴏᴘᴇɴ ɪꜱꜱᴜᴇꜱ: *{issues}*\n┊ 💻 ʟᴀɴɢᴜᴀɢᴇꜱ: *{langs}*\n┊ ⚖️ ʟɪᴄᴇɴꜱᴇ: *{license}* | 📦 ꜱɪᴢᴇ: *{size}*\n┊ 🆕 ᴄʀᴇᴀᴛᴇᴅ: {created} | 🔄 ᴜᴘᴅᴀᴛᴇᴅ: {updated}\n┊ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ: {desc}\n┊ 🔗 {url}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.scanrepo facebook/react', expect: /react|Bintang|Stars/i }

// Urai masukan menjadi { owner, repo }.
export function parseRepoInput(text) {
  const src = String(text || '').trim()
  const fromUrl = src.match(/github\.com\/([\w.-]+)\/([\w.-]+)/)
  if (fromUrl) return { owner: fromUrl[1], repo: fromUrl[2].replace(/\.git$/, '') }
  const plain = src.match(/^([\w.-]+)\/([\w.-]+)$/)
  if (plain) return { owner: plain[1], repo: plain[2] }
  return null
}

async function ghGet(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    signal: AbortSignal.timeout(20000),
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'KANA-Bot' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
  return res.json()
}

export function formatSize(kb) {
  if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB'
  return kb + ' KB'
}

export async function handler(ctx, { api = ghGet } = {}) {
  const parsed = parseRepoInput(ctx.text || '')
  if (!parsed) return ctx.reply(ctx.t('scanrepo.needRepo'))
  const slug = `${parsed.owner}/${parsed.repo}`
  try {
    const repo = await api(`/repos/${slug}`)
    if (!repo) return ctx.reply(ctx.t('scanrepo.notFound', { repo: slug }))
    let langs = repo.language || '-'
    try {
      const langData = await api(`/repos/${slug}/languages`)
      if (langData) {
        const top = Object.entries(langData).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
        if (top.length) langs = top.join(', ')
      }
    } catch {}
    return ctx.reply(ctx.t('scanrepo.body', {
      name: repo.full_name,
      owner: repo.owner?.login || parsed.owner,
      stars: Number(repo.stargazers_count || 0).toLocaleString('id-ID'),
      forks: Number(repo.forks_count || 0).toLocaleString('id-ID'),
      issues: Number(repo.open_issues_count || 0).toLocaleString('id-ID'),
      langs,
      license: repo.license?.spdx_id || '-',
      size: formatSize(Number(repo.size || 0)),
      created: String(repo.created_at || '').slice(0, 10),
      updated: String(repo.updated_at || '').slice(0, 10),
      desc: repo.description || '-',
      url: repo.html_url,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('scanrepo.failed', { message: err.message }))
  }
}
