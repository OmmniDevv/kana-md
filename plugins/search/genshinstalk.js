// Profil Genshin Impact dari API publik Enka Network (enka.network,
// tanpa kunci). Terverifikasi dari VM 2026-11-05 dengan UID contoh.
export const config = {
  name: 'genshinstalk',
  alias: ['genshin', 'stalkgenshin', 'gi'],
  category: 'search',
  description: { id: 'Lihat info akun Genshin Impact dari UID (Enka Network)', en: 'See a Genshin Impact account info from its UID (Enka Network)' },
  usage: '.genshinstalk <uid>',
  example: '.genshinstalk 800000000',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    genshinstalk: {
      needUid: '╭─❏ 🎮 「 *KETIK UID-NYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.genshinstalk 800000000*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *UID TIDAK KETEMU* 」\n┊ Mouu, UID *{uid}* tidak ketemu atau profilnya disembunyikan~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL DATA* 」\n┊ Mouu, gagal ambil data Genshin-nya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      body: '╭─❏ 🎮 「 *GENSHIN IMPACT* 」\n┊ ɴɪᴄᴋɴᴀᴍᴇ: *{nickname}*\n┊ ᴜɪᴅ: *{uid}* ({region})\n┊ ᴀᴅᴠᴇɴᴛᴜʀᴇ ʀᴀɴᴋ: *{level}* (World Level {worldLevel})\n┊ ᴀᴄʜɪᴇᴠᴇᴍᴇɴᴛ: *{achievements}*\n┊ ꜱᴘɪʀᴀʟ ᴀʙʏꜱꜱ: Lantai {abyssFloor}-{abyssChamber}\n┊ ᴋᴀʀᴀᴋᴛᴇʀ ᴅɪᴘᴀᴊᴀɴɢ: *{showcase}*\n┊ ꜱɪɢɴᴀᴛᴜʀᴇ: {signature}\n╰━━━━━━━',
    },
  },
  en: {
    genshinstalk: {
      needUid: '╭─❏ 🎮 「 *TYPE THE UID* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.genshinstalk 800000000*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *UID NOT FOUND* 」\n┊ Mouu, UID *{uid}* was not found or the profile is hidden~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH* 」\n┊ Mouu, failed to fetch the Genshin data: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      body: '╭─❏ 🎮 「 *GENSHIN IMPACT* 」\n┊ ɴɪᴄᴋɴᴀᴍᴇ: *{nickname}*\n┊ ᴜɪᴅ: *{uid}* ({region})\n┊ ᴀᴅᴠᴇɴᴛᴜʀᴇ ʀᴀɴᴋ: *{level}* (World Level {worldLevel})\n┊ ᴀᴄʜɪᴇᴠᴇᴍᴇɴᴛ: *{achievements}*\n┊ ꜱᴘɪʀᴀʟ ᴀʙʏꜱꜱ: Floor {abyssFloor}-{abyssChamber}\n┊ ꜱʜᴏᴡᴄᴀꜱᴇ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ: *{showcase}*\n┊ ꜱɪɢɴᴀᴛᴜʀᴇ: {signature}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.genshinstalk 800000000', expect: /uoooon|Adventure/i }

export function parseEnkaProfile(json, uid) {
  const info = json?.playerInfo
  if (!info || !info.nickname) return null
  return {
    nickname: info.nickname,
    uid: json.uid || uid,
    region: json.region || '-',
    level: info.level ?? '-',
    worldLevel: info.worldLevel ?? '-',
    achievements: info.finishAchievementNum ?? 0,
    abyssFloor: info.towerFloorIndex ?? 0,
    abyssChamber: info.towerLevelIndex ?? 0,
    showcase: Array.isArray(json.avatarInfoList) ? json.avatarInfoList.length : 0,
    signature: info.signature || '-',
  }
}

async function fetchEnka(uid) {
  const res = await fetch(`https://enka.network/api/uid/${encodeURIComponent(uid)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', accept: 'application/json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Enka HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { fetchProfile = fetchEnka } = {}) {
  const uid = (ctx.text || '').trim().split(/\s+/)[0]
  if (!uid || !/^\d{6,}$/.test(uid)) return ctx.reply(ctx.t('genshinstalk.needUid'))
  let profile
  try {
    profile = parseEnkaProfile(await fetchProfile(uid), uid)
  } catch (err) {
    return ctx.reply(ctx.t('genshinstalk.failed', { message: err.message }))
  }
  if (!profile) return ctx.reply(ctx.t('genshinstalk.notFound', { uid }))
  return ctx.reply(ctx.t('genshinstalk.body', profile))
}
