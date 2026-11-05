// Stalk profil Pinterest publik dari halaman profil resminya. Data
// profil tertanam sebagai JSON di halaman (follower_count, pin_count);
// terverifikasi 2026-11-05 untuk akun pinterest.
export const config = {
  name: 'pintereststalk',
  alias: ['pinstalk'],
  category: 'search',
  description: { id: 'Stalk profil Pinterest publik: pengikut, pin, board, bio', en: 'Stalk a public Pinterest profile: followers, pins, boards, bio' },
  usage: '.pintereststalk <username>',
  example: '.pintereststalk pinterest',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    pintereststalk: {
      needUser: '╭─❏ 📌 「 *KETIK USERNAMENYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.pintereststalk pinterest*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *AKUN TIDAK KETEMU* 」\n┊ Mouu, akun Pinterest *{user}* tidak ketemu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL STALK* 」\n┊ Mouu, gagal ambil profilnya: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 📌 「 *PINTEREST: {name}* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{user}*\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{followers}*\n┊ ᴍᴇɴɢɪᴋᴜᴛɪ: *{following}*\n┊ ᴘɪɴ: *{pins}*\n┊ ʙᴏᴀʀᴅ: *{boards}*\n┊ ʙɪᴏ: {bio}\n┊ 🔗 https://www.pinterest.com/{user}/\n╰━━━━━━━',
    },
  },
  en: {
    pintereststalk: {
      needUser: '╭─❏ 📌 「 *TYPE THE USERNAME* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.pintereststalk pinterest*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *ACCOUNT NOT FOUND* 」\n┊ Mouu, the Pinterest account *{user}* was not found~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *STALK FAILED* 」\n┊ Mouu, failed to fetch the profile: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 📌 「 *PINTEREST: {name}* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{user}*\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{followers}*\n┊ ꜰᴏʟʟᴏᴡɪɴɢ: *{following}*\n┊ ᴘɪɴꜱ: *{pins}*\n┊ ʙᴏᴀʀᴅꜱ: *{boards}*\n┊ ʙɪᴏ: {bio}\n┊ 🔗 https://www.pinterest.com/{user}/\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pintereststalk pinterest', expect: /PINTEREST:/ }

export function parsePinterestProfile(html, user) {
  const src = String(html || '')
  const num = (re) => {
    const m = src.match(re)
    return m ? Number(m[1]) : null
  }
  const str = (re) => (src.match(re) || [])[1] || null
  const followers = num(/"follower_count":\s*(\d+)/)
  if (followers === null) return null
  return {
    user,
    name: str(/"full_name":\s*"([^"]+)"/) || str(/property="og:title" content="([^"]+)"/) || user,
    followers: followers.toLocaleString('id-ID'),
    following: (num(/"following_count":\s*(\d+)/) ?? 0).toLocaleString('id-ID'),
    pins: (num(/"pin_count":\s*(\d+)/) ?? 0).toLocaleString('id-ID'),
    boards: (num(/"board_count":\s*(\d+)/) ?? 0).toLocaleString('id-ID'),
    bio: (str(/"bio":\s*"([^"]{1,200})"/) || '-').replace(/\\n/g, ' ').trim() || '-',
  }
}

async function fetchProfile(user) {
  const res = await fetch(`https://www.pinterest.com/${encodeURIComponent(user)}/`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`Pinterest HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { fetchHtml = fetchProfile } = {}) {
  const user = (ctx.text || '').trim().replace(/^@/, '').split(/\s+/)[0]
  if (!user) return ctx.reply(ctx.t('pintereststalk.needUser'))
  let profile
  try {
    profile = parsePinterestProfile(await fetchHtml(user), user)
  } catch (err) {
    return ctx.reply(ctx.t('pintereststalk.failed', { message: err.message }))
  }
  if (!profile) return ctx.reply(ctx.t('pintereststalk.notFound', { user }))
  return ctx.reply(ctx.t('pintereststalk.body', profile))
}
