import { renderShipCard } from '../../src/ui/ship-card.js'
import { getProfile } from '../../src/services/user-service.js'

// Ship: kartu canvas pasangan berisi dua foto profil dan persen
// kecocokan, seperti ship Elaina-MD (khusus grup, dua orang yang
// di-ship). Satu mention berarti pengirim dipasangkan dengan orang itu.
export const config = {
  name: 'ship',
  alias: [],
  category: 'canvas',
  description: { id: 'Kartu canvas ship dua member dengan foto profil dan persen kecocokan', en: 'Ship canvas card of two members with profile photos and match percent' },
  usage: '.ship @user1 @user2',
  example: '.ship @6281234567890 @6289876543210',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    ship: {
      caption: '╭─❏ 💘 「 *SHIP RESULT* 」\n┊ *@{digits1}* x *@{digits2}*\n┊ Kecocokan: *{percent}%*\n┊ {verdict}\n╰━━━━━━━',
      hint: '╭─❏ 💘 「 *SHIP* 」\n┊ Tag dua orang yang mau di-ship yaa~\n┊ Contoh: *.ship @user1 @user2*\n┊ Satu tag juga bisa, kamu dipasangkan sama dia~\n╰━━━━━━━',
      verdictHigh: 'Cocok banget, kayak kopi sama susu~',
      verdictMid: 'Lumayan cocok, tinggal komunikasinya dijaga~',
      verdictLow: 'Butuh usaha ekstra, tapi jodoh siapa yang tahu~',
      fail: '╭─❏ 💦 「 *SHIP GAGAL* 」\n┊ Mouu, kartu shipnya gagal dibuat: *{message}*\n╰━━━━━━━',
      cardTitle: 'SHIP',
    },
  },
  en: {
    ship: {
      caption: '╭─❏ 💘 「 *SHIP RESULT* 」\n┊ *@{digits1}* x *@{digits2}*\n┊ Match: *{percent}%*\n┊ {verdict}\n╰━━━━━━━',
      hint: '╭─❏ 💘 「 *SHIP* 」\n┊ Tag two people to ship please~\n┊ Example: *.ship @user1 @user2*\n┊ One tag works too, you get paired with them~\n╰━━━━━━━',
      verdictHigh: 'Super compatible, like coffee and milk~',
      verdictMid: 'Pretty compatible, just keep communicating~',
      verdictLow: 'Needs extra effort, but who knows fate~',
      fail: '╭─❏ 💦 「 *SHIP FAILED* 」\n┊ Mouu, the ship card failed: *{message}*\n╰━━━━━━━',
      cardTitle: 'SHIP',
    },
  },
}

export const test = { input: '.ship @6281234567890 @6289876543210', expect: /ship result/i }

function digitsOf(jid) {
  return String(jid ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

// Pasangan ship: dua mention berbeda, atau pengirim + satu mention.
export function resolveShipPair(ctx) {
  const mentions = [...new Set((ctx.mentionedJids ?? []).filter(Boolean))]
  if (mentions.length >= 2) return [mentions[0], mentions[1]]
  if (mentions.length === 1) {
    if (digitsOf(mentions[0]) === digitsOf(ctx.sender)) return null
    return [ctx.sender, mentions[0]]
  }
  return null
}

export function pickPercent(rng = Math.random) {
  return Math.min(100, Math.floor(rng() * 101))
}

// Foto profil satu JID menjadi Buffer; semua kegagalan menghasilkan null.
export async function fetchAvatarBuffer(ctx, jid) {
  try {
    if (typeof ctx.sock?.profilePictureUrl !== 'function') return null
    const url = await ctx.sock.profilePictureUrl(jid, 'image')
    if (!url || typeof url !== 'string') return null
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res?.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    return buffer.length ? buffer : null
  } catch {
    return null
  }
}

async function displayName(ctx, jid) {
  const digits = digitsOf(jid)
  if (digits === digitsOf(ctx.sender)) return ctx.pushName || digits
  try {
    const profile = await getProfile(ctx.storage, digits)
    return profile.name || profile.regName || digits
  } catch {
    return digits
  }
}

export async function handler(ctx) {
  const pair = resolveShipPair(ctx)
  if (!pair) return ctx.reply(ctx.t('ship.hint'))
  const [jid1, jid2] = pair
  const percent = pickPercent()
  try {
    const [avatar1Buffer, avatar2Buffer, name1, name2] = await Promise.all([
      fetchAvatarBuffer(ctx, jid1),
      fetchAvatarBuffer(ctx, jid2),
      displayName(ctx, jid1),
      displayName(ctx, jid2),
    ])
    const image = await renderShipCard({
      name1,
      name2,
      avatar1Buffer,
      avatar2Buffer,
      percent,
      title: ctx.t('ship.cardTitle'),
    })
    const verdict = percent >= 70 ? ctx.t('ship.verdictHigh') : percent >= 40 ? ctx.t('ship.verdictMid') : ctx.t('ship.verdictLow')
    const caption = ctx.t('ship.caption', { digits1: digitsOf(jid1), digits2: digitsOf(jid2), percent, verdict })
    return ctx.sock.sendMessage(ctx.chat, { image, caption, mentions: [jid1, jid2] }, { quoted: ctx.raw })
  } catch (err) {
    return ctx.reply(ctx.t('ship.fail', { message: err.message }))
  }
}
