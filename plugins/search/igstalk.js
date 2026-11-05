// Stalk profil Instagram publik lewat Imginn (imginn.com), karena API
// profil resmi Instagram membalas 429 dari VM bot. Terverifikasi
// 2026-11-05 untuk @instagram: nama, bio, jumlah pos, pengikut, mengikuti.
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'igstalk',
  alias: ['instagramstalk'],
  category: 'search',
  description: { id: 'Stalk profil Instagram publik: bio, pos, pengikut, mengikuti', en: 'Stalk a public Instagram profile: bio, posts, followers, following' },
  usage: '.igstalk <username>',
  example: '.igstalk instagram',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    igstalk: {
      needUser: '╭─❏ 📸 「 *KETIK USERNAMENYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.igstalk instagram*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *AKUN TIDAK KETEMU* 」\n┊ Mouu, akun *@{user}* tidak ketemu atau privat~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL STALK* 」\n┊ Mouu, gagal ambil profilnya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      body: '╭─❏ 📸 「 *@{user}* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴘᴏꜱ: *{posts}*\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{followers}*\n┊ ᴍᴇɴɢɪᴋᴜᴛɪ: *{following}*\n┊ ʙɪᴏ: {bio}\n┊ 🔗 https://instagram.com/{user}\n╰━━━━━━━',
    },
  },
  en: {
    igstalk: {
      needUser: '╭─❏ 📸 「 *TYPE THE USERNAME* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.igstalk instagram*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *ACCOUNT NOT FOUND* 」\n┊ Mouu, the account *@{user}* was not found or is private~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *STALK FAILED* 」\n┊ Mouu, failed to fetch the profile: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      body: '╭─❏ 📸 「 *@{user}* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴘᴏꜱᴛꜱ: *{posts}*\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{followers}*\n┊ ꜰᴏʟʟᴏᴡɪɴɢ: *{following}*\n┊ ʙɪᴏ: {bio}\n┊ 🔗 https://instagram.com/{user}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.igstalk instagram', expect: /Followers|Pengikut|ᴘᴇɴɢɪᴋᴜᴛ/ }

// Urai halaman profil Imginn menjadi data profil.
export function parseImginnProfile(html, user) {
  const src = String(html || '')
  const pick = (re) => (src.match(re) || [])[1] || null
  // Pola paling tak ambigu: meta description "686.3M Followers, 166
  // Following, 449 Posts" milik profil yang dicari. Regex global biasa
  // bisa tertukar dengan kartu akun saran di halaman yang sama.
  const meta = src.match(/([\d.,]+[KM]?)\s*Followers,\s*([\d.,]+[KM]?)\s*Following,\s*([\d.,]+[KM]?)\s*Posts/i)
  const followers = meta ? meta[1] : pick(/([\d.,]+[KM]?)\s*Followers/i)
  if (!followers) return null
  const decode = (v) => (v || '').replace(/&#38;|&amp;/g, '&')
  return {
    user,
    name: (pick(/<h1[^>]*>([^<]+)<\/h1>/) || pick(/property="og:title" content="([^"]+)"/) || user).split('(')[0].trim(),
    posts: meta ? meta[3] : (pick(/([\d.,]+[KM]?)\s*Posts/i) || '-'),
    followers,
    following: meta ? meta[2] : (pick(/([\d.,]+[KM]?)\s*Following/i) || '-'),
    bio: (pick(/class="bio"[^>]*>([\s\S]{0,300}?)</) || pick(/property="og:description" content="([^"]+)"/) || '-').replace(/<[^>]+>/g, '').replace(/&apos;/g, "'").trim() || '-',
    avatar: decode(pick(/property="og:image" content="([^"]+)"/)),
  }
}

async function fetchProfile(user) {
  const res = await fetch(`https://imginn.com/${encodeURIComponent(user)}/`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`Imginn HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { fetchHtml = fetchProfile } = {}) {
  const user = (ctx.text || '').trim().replace(/^@/, '').split(/\s+/)[0]
  if (!user) return ctx.reply(ctx.t('igstalk.needUser'))
  let profile
  try {
    profile = parseImginnProfile(await fetchHtml(user), user)
  } catch (err) {
    return ctx.reply(ctx.t('igstalk.failed', { message: err.message }))
  }
  if (!profile) return ctx.reply(ctx.t('igstalk.notFound', { user }))
  const body = ctx.t('igstalk.body', profile)
  if (profile.avatar) {
    try {
      const { buffer } = await downloadBuffer(profile.avatar, { maxBytes: 8 * 1024 * 1024, timeout: 20000 })
      await sendImage(ctx, buffer, { caption: body })
      return undefined
    } catch {}
  }
  return ctx.reply(body)
}
