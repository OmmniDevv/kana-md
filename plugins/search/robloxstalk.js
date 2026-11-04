// Stalk publik Roblox: API publik resmi Roblox (users.roblox.com),
// pengecualian setara API game di DECISIONS.md. Data publik saja.
export const config = {
  name: 'robloxstalk',
  alias: ['roblox', 'stalkroblox', 'robloxplayer', 'robloxsearch'],
  category: 'search',
  description: { id: 'Info profil publik Roblox dari username', en: 'Public Roblox profile info from a username' },
  usage: '.robloxstalk <username>',
  example: '.robloxstalk builderman',
  cooldown: 10,
}

export const i18n = {
  id: {
    robloxstalk: {
      hint: 'Tulis username Roblox-nya yaa~ Contoh: .robloxstalk builderman',
      body: '🧱 PROFIL ROBLOX\n\nUsername: {username}\nNama tampil: {display}\nID: {id}\nTeman: {friends} · Pengikut: {followers} · Mengikuti: {following}\nBergabung: {joined}\nProfil: {url}',
      notFound: 'User Roblox itu tidak ditemukan. {mood}',
      fail: 'Gagal ambil data Roblox: {error}',
    },
  },
  en: {
    robloxstalk: {
      hint: 'Write the Roblox username please~ Example: .robloxstalk builderman',
      body: '🧱 ROBLOX PROFILE\n\nUsername: {username}\nDisplay name: {display}\nID: {id}\nFriends: {friends} · Followers: {followers} · Following: {following}\nJoined: {joined}\nProfile: {url}',
      notFound: 'That Roblox user was not found. {mood}',
      fail: 'Failed to fetch Roblox data: {error}',
    },
  },
}

export const test = { input: '.robloxstalk', expect: /username/i }

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx) {
  const username = (ctx.text || '').trim().split(/\s+/)[0]
  if (!username) return ctx.reply(ctx.t('robloxstalk.hint'))
  try {
    const found = await postJson('https://users.roblox.com/v1/usernames/users', { usernames: [username], excludeBannedUsers: true })
    const user = found.data?.[0]
    if (!user) return ctx.reply(ctx.t('robloxstalk.notFound', { mood: ctx.say('gagal') }))
    const [profile, friends, followers, following] = await Promise.all([
      getJson(`https://users.roblox.com/v1/users/${user.id}`),
      getJson(`https://friends.roblox.com/v1/users/${user.id}/friends/count`).catch(() => ({ count: '?' })),
      getJson(`https://friends.roblox.com/v1/users/${user.id}/followers/count`).catch(() => ({ count: '?' })),
      getJson(`https://friends.roblox.com/v1/users/${user.id}/followings/count`).catch(() => ({ count: '?' })),
    ])
    return ctx.reply(ctx.t('robloxstalk.body', {
      username: profile.name,
      display: profile.displayName,
      id: user.id,
      friends: friends.count,
      followers: followers.count,
      following: following.count,
      joined: profile.created ? new Date(profile.created).toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID') : '-',
      url: `https://www.roblox.com/users/${user.id}/profile`,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('robloxstalk.fail', { error: err.message }))
  }
}
