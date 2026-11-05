// Stalk profil TikTok publik dari halaman profil resminya. Data tertanam
// di JSON __UNIVERSAL_DATA_FOR_REHYDRATION__; terverifikasi 2026-11-05
// untuk @tiktok (pengikut, mengikuti, suka, jumlah video).
export const config = {
  name: 'tiktokstalk',
  alias: ['ttstalk'],
  category: 'search',
  description: { id: 'Stalk profil TikTok publik: pengikut, suka, jumlah video', en: 'Stalk a public TikTok profile: followers, likes, video count' },
  usage: '.tiktokstalk <username>',
  example: '.tiktokstalk tiktok',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    tiktokstalk: {
      needUser: '╭─❏ 🎵 「 *KETIK USERNAMENYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.tiktokstalk tiktok*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *AKUN TIDAK KETEMU* 」\n┊ Mouu, akun TikTok *@{user}* tidak ketemu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL STALK* 」\n┊ Mouu, gagal ambil profilnya: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🎵 「 *@{user}* 」\n┊ ɴᴀᴍᴀ: *{nickname}* {verified}\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{followers}*\n┊ ᴍᴇɴɢɪᴋᴜᴛɪ: *{following}*\n┊ ꜱᴜᴋᴀ: *{likes}*\n┊ ᴠɪᴅᴇᴏ: *{videos}*\n┊ ʙɪᴏ: {bio}\n╰━━━━━━━',
    },
  },
  en: {
    tiktokstalk: {
      needUser: '╭─❏ 🎵 「 *TYPE THE USERNAME* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.tiktokstalk tiktok*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *ACCOUNT NOT FOUND* 」\n┊ Mouu, the TikTok account *@{user}* was not found~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *STALK FAILED* 」\n┊ Mouu, failed to fetch the profile: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🎵 「 *@{user}* 」\n┊ ɴᴀᴍᴇ: *{nickname}* {verified}\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{followers}*\n┊ ꜰᴏʟʟᴏᴡɪɴɢ: *{following}*\n┊ ʟɪᴋᴇꜱ: *{likes}*\n┊ ᴠɪᴅᴇᴏꜱ: *{videos}*\n┊ ʙɪᴏ: {bio}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tiktokstalk tiktok', expect: /@tiktok|TikTok/ }

function fmt(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '-'
  if (v >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(v)
}

// Ekstrak blok JSON rehidrasi TikTok dari HTML profil.
export function extractTikTokJson(html) {
  const m = String(html || '').match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

export function parseTikTokProfile(json, user) {
  const detail = json?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']
  const info = detail?.userInfo
  if (!info?.user) return null
  const u = info.user
  const s = info.stats || {}
  return {
    user: u.uniqueId || user,
    nickname: u.nickname || '-',
    verified: u.verified ? '☑️' : '',
    followers: fmt(s.followerCount),
    following: fmt(s.followingCount),
    likes: fmt(s.heartCount),
    videos: fmt(s.videoCount),
    bio: u.signature || '-',
  }
}

async function fetchProfile(user) {
  const res = await fetch(`https://www.tiktok.com/@${encodeURIComponent(user)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`TikTok HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { fetchHtml = fetchProfile } = {}) {
  const user = (ctx.text || '').trim().replace(/^@/, '').split(/\s+/)[0]
  if (!user) return ctx.reply(ctx.t('tiktokstalk.needUser'))
  let profile
  try {
    profile = parseTikTokProfile(extractTikTokJson(await fetchHtml(user)), user)
  } catch (err) {
    return ctx.reply(ctx.t('tiktokstalk.failed', { message: err.message }))
  }
  if (!profile) return ctx.reply(ctx.t('tiktokstalk.notFound', { user }))
  return ctx.reply(ctx.t('tiktokstalk.body', profile))
}
