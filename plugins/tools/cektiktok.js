import { tiktokProfile } from '../../src/scrapers/kindb/social.js'

export const config = {
  name: 'cektiktok',
  alias: [],
  category: 'tools',
  description: { id: 'Cek info akun TikTok publik: ID, nama, pengikut, mengikuti, video, dan suka. Tanpa argumen memakai username yang kamu daftarkan lewat .daftartiktok', en: 'Check public TikTok account info: ID, name, followers, following, videos, and likes. Without an argument it uses the username you registered via .daftartiktok' },
  usage: '.cektiktok [username]',
  example: '.cektiktok tiktok',
  cooldown: 8,
}

export const i18n = {
  id: {
    cektiktok: {
      hint: '╭─❏ 🎵 「 *CEK TIKTOK* 」\n┊ Tulis username TikToknya yaa, contoh: *.cektiktok tiktok*\n┊ Atau daftarkan dulu punyamu lewat *.daftartiktok <username>*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *AKUN TIDAK KETEMU* 」\n┊ Mouu, akun TikTok *{q}* tidak ketemu atau profilnya tidak publik~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal cek TikTok: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 🎵 「 *{nickname}* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{username}*\n┊ ɪᴅ: *{id}*\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{followers}*\n┊ ᴍᴇɴɢɪᴋᴜᴛɪ: *{following}*\n┊ ᴠɪᴅᴇᴏ: *{videos}*\n┊ ꜱᴜᴋᴀ: *{hearts}*\n┊ ᴛᴇʀᴠᴇʀɪꜰɪᴋᴀꜱɪ: *{verified}*\n┊ ᴘʀᴏꜰɪʟ: {url}\n╰━━━━━━━',
      yes: 'Ya',
      no: 'Tidak',
    },
  },
  en: {
    cektiktok: {
      hint: '╭─❏ 🎵 「 *CHECK TIKTOK* 」\n┊ Write the TikTok username, example: *.cektiktok tiktok*\n┊ Or register yours first via *.daftartiktok <username>*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *ACCOUNT NOT FOUND* 」\n┊ Mouu, TikTok account *{q}* was not found or its profile is not public~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to check TikTok: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 🎵 「 *{nickname}* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{username}*\n┊ ɪᴅ: *{id}*\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{followers}*\n┊ ꜰᴏʟʟᴏᴡɪɴɢ: *{following}*\n┊ ᴠɪᴅᴇᴏꜱ: *{videos}*\n┊ ʟɪᴋᴇꜱ: *{hearts}*\n┊ ᴠᴇʀɪꜰɪᴇᴅ: *{verified}*\n┊ ᴘʀᴏꜰɪʟᴇ: {url}\n╰━━━━━━━',
      yes: 'Yes',
      no: 'No',
    },
  },
}

export const test = { input: '.cektiktok tiktok', expect: /@tiktok|TikTok|Pengikut|Followers/i }

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('id-ID') : '-')

export async function handler(ctx) {
  let q = (ctx.text || '').trim().replace(/^@/, '')
  if (!q && ctx.storage && ctx.senderDigits) {
    const saved = await ctx.storage.get('tiktok', ctx.senderDigits).catch(() => null)
    if (saved?.username) q = saved.username
  }
  if (!q) return ctx.reply(ctx.t('cektiktok.hint'))
  try {
    const p = await tiktokProfile(q)
    if (!p) return ctx.reply(ctx.t('cektiktok.notfound', { q }))
    return ctx.reply(ctx.t('cektiktok.card', {
      nickname: p.nickname, username: p.uniqueId, id: p.id || '-',
      followers: fmt(p.followers), following: fmt(p.following), videos: fmt(p.videos), hearts: fmt(p.hearts),
      verified: p.verified ? ctx.t('cektiktok.yes') : ctx.t('cektiktok.no'),
      url: p.url,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('cektiktok.fail', { message: err.message }))
  }
}
