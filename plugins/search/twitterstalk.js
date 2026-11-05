// Stalk profil X/Twitter publik lewat API publik FxTwitter
// (api.fxtwitter.com, tanpa kunci). Terverifikasi 2026-11-05 untuk
// @elonmusk: nama, pengikut, mengikuti, jumlah tweet, bio.
export const config = {
  name: 'twitterstalk',
  alias: ['xstalk'],
  category: 'search',
  description: { id: 'Stalk profil X (Twitter) publik: pengikut, tweet, bio', en: 'Stalk a public X (Twitter) profile: followers, tweets, bio' },
  usage: '.twitterstalk <username>',
  example: '.twitterstalk elonmusk',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    twitterstalk: {
      needUser: '╭─❏ 🐦 「 *KETIK USERNAMENYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.twitterstalk elonmusk*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *AKUN TIDAK KETEMU* 」\n┊ Mouu, akun X *@{user}* tidak ketemu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL STALK* 」\n┊ Mouu, gagal ambil profilnya: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🐦 「 *{name}* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{user}* {verified}\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{followers}*\n┊ ᴍᴇɴɢɪᴋᴜᴛɪ: *{following}*\n┊ ᴛᴡᴇᴇᴛ: *{tweets}*\n┊ ʙᴇʀɢᴀʙᴜɴɢ: *{joined}*\n┊ ʙɪᴏ: {bio}\n╰━━━━━━━',
    },
  },
  en: {
    twitterstalk: {
      needUser: '╭─❏ 🐦 「 *TYPE THE USERNAME* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.twitterstalk elonmusk*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *ACCOUNT NOT FOUND* 」\n┊ Mouu, the X account *@{user}* was not found~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *STALK FAILED* 」\n┊ Mouu, failed to fetch the profile: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🐦 「 *{name}* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{user}* {verified}\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{followers}*\n┊ ꜰᴏʟʟᴏᴡɪɴɢ: *{following}*\n┊ ᴛᴡᴇᴇᴛꜱ: *{tweets}*\n┊ ᴊᴏɪɴᴇᴅ: *{joined}*\n┊ ʙɪᴏ: {bio}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.twitterstalk elonmusk', expect: /Elon|@elonmusk/ }

function fmt(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '-'
  return v.toLocaleString('id-ID')
}

export function parseFxProfile(json, user) {
  const u = json?.user
  if (!u || !u.screen_name) return null
  return {
    user: u.screen_name || user,
    name: u.name || user,
    verified: u.verified ? '☑️' : '',
    followers: fmt(u.followers),
    following: fmt(u.following),
    tweets: fmt(u.tweets),
    joined: u.joined || '-',
    bio: u.description || '-',
  }
}

async function fetchProfile(user) {
  const res = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(user)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', accept: 'application/json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`FxTwitter HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { fetchJson = fetchProfile } = {}) {
  const user = (ctx.text || '').trim().replace(/^@/, '').split(/\s+/)[0]
  if (!user) return ctx.reply(ctx.t('twitterstalk.needUser'))
  let profile
  try {
    profile = parseFxProfile(await fetchJson(user), user)
  } catch (err) {
    return ctx.reply(ctx.t('twitterstalk.failed', { message: err.message }))
  }
  if (!profile) return ctx.reply(ctx.t('twitterstalk.notFound', { user }))
  return ctx.reply(ctx.t('twitterstalk.body', profile))
}
