// Stalk publik GitHub: API resmi GitHub tanpa kunci (rate limit publik),
// kelas pengecualian yang sama dengan Jikan di DECISIONS.md.
export const config = {
  name: 'ghuser',
  alias: ['githubstalk', 'github'],
  category: 'search',
  description: { id: 'Info profil publik GitHub seseorang dari username', en: 'Public GitHub profile info from a username' },
  usage: '.ghuser <username>',
  example: '.ghuser OmmniDevv',
  cooldown: 10,
}

export const i18n = {
  id: {
    ghuser: {
      hint: 'Tulis username GitHub-nya yaa~ Contoh: .ghuser OmmniDevv',
      body: '🐙 PROFIL GITHUB\n\nNama: {name} (@{login})\nBio: {bio}\nRepo publik: {repos}\nPengikut: {followers} · Mengikuti: {following}\nLokasi: {location}\nBergabung: {joined}\nProfil: {url}',
      notFound: 'User GitHub @{username} tidak ditemukan. {mood}',
      fail: 'Gagal ambil data GitHub: {error}',
      empty: '-',
    },
  },
  en: {
    ghuser: {
      hint: 'Write the GitHub username please~ Example: .ghuser OmmniDevv',
      body: '🐙 GITHUB PROFILE\n\nName: {name} (@{login})\nBio: {bio}\nPublic repos: {repos}\nFollowers: {followers} · Following: {following}\nLocation: {location}\nJoined: {joined}\nProfile: {url}',
      notFound: 'GitHub user @{username} was not found. {mood}',
      fail: 'Failed to fetch GitHub data: {error}',
      empty: '-',
    },
  },
}

export const test = { input: '.ghuser', expect: /username/i }

export async function handler(ctx) {
  const username = (ctx.text || '').trim().replace(/^@/, '').split(/\s+/)[0]
  if (!username) return ctx.reply(ctx.t('ghuser.hint'))
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { 'user-agent': 'kana-md', accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(20000),
    })
    if (res.status === 404) return ctx.reply(ctx.t('ghuser.notFound', { username, mood: ctx.say('gagal') }))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const d = await res.json()
    const empty = ctx.t('ghuser.empty')
    return ctx.reply(ctx.t('ghuser.body', {
      name: d.name || empty,
      login: d.login,
      bio: d.bio || empty,
      repos: d.public_repos ?? 0,
      followers: d.followers ?? 0,
      following: d.following ?? 0,
      location: d.location || empty,
      joined: d.created_at ? new Date(d.created_at).toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID') : empty,
      url: d.html_url,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('ghuser.fail', { error: err.message }))
  }
}
