import { renderWaProfileCard, formatWaNumber } from '../../src/ui/wa-profile-card.js'

// Fake WhatsApp profile card: gambar kartu profil WA dari foto profil
// target, meniru perilaku wa-canvas Elaina-MD owner (render canvas lalu
// kirim sebagai gambar), dengan template orisinal KANA di
// src/ui/wa-profile-card.js. Target: yang di-tag, pengirim pesan yang
// di-reply, atau pengirim sendiri. Argumen opsional ala Elaina tetap
// didukung: .wa-canvas Nama | Nomor | Status menimpa data kartunya.
export const config = {
  name: 'wa-canvas',
  alias: ['fakewaprofile'],
  category: 'fun',
  description: { id: 'Buat fake WhatsApp profile card dari foto profil target', en: 'Make a fake WhatsApp profile card from the target profile picture' },
  usage: '.wa-canvas [Nama | Nomor | Status]',
  example: '.wa-canvas',
  cooldown: 15,
}

export const i18n = {
  id: {
    'wa-canvas': {
      caption: '╭─❏ 📱 「 *FAKE WHATSAPP PROFILE* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL BIKIN KARTU* 」\n┊ Mouu, kartunya gagal dibuat: *{message}*\n╰━━━━━━━',
      profile: 'Profil',
      statusLabel: 'Status',
      phoneLabel: 'Nomor HP',
      footer: 'Kartu palsu buatan KANA, cuma buat seru-seruan~',
      defaultStatus: 'Sibuk',
    },
  },
  en: {
    'wa-canvas': {
      caption: '╭─❏ 📱 「 *FAKE WHATSAPP PROFILE* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *CARD FAILED* 」\n┊ Mouu, the card could not be made: *{message}*\n╰━━━━━━━',
      profile: 'Profile',
      statusLabel: 'Status',
      phoneLabel: 'Phone',
      footer: 'A fake card made by KANA, just for fun~',
      defaultStatus: 'Busy',
    },
  },
}

export const test = { input: '.wa-canvas', expect: /fake whatsapp profile/i }

function digitsOf(jid) {
  return String(jid ?? '').split('@')[0].split(':')[0]
}

// Target kartu: mention pertama, lalu pengirim pesan yang di-reply, lalu
// pengirim perintah sendiri.
export function resolveTargetJid(ctx) {
  const mentioned = ctx.mentionedJids?.[0]
  if (mentioned) return mentioned
  if (ctx.quoted?.sender) return ctx.quoted.sender
  return ctx.sender
}

// Foto untuk avatar: gambar yang di-reply bila ada, selain itu foto
// profil target. Semua kegagalan menghasilkan null (placeholder inisial).
export async function fetchAvatarBuffer(ctx, targetJid) {
  if (ctx.quoted?.message?.imageMessage && typeof ctx.downloadQuoted === 'function') {
    try {
      const media = await ctx.downloadQuoted()
      const buffer = media?.buffer ?? media
      if (Buffer.isBuffer(buffer) && buffer.length) return buffer
    } catch {
      // Lanjut ke foto profil.
    }
  }
  try {
    if (typeof ctx.sock?.profilePictureUrl !== 'function') return null
    const url = await ctx.sock.profilePictureUrl(targetJid, 'image')
    if (!url || typeof url !== 'string') return null
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res?.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    return buffer.length ? buffer : null
  } catch {
    return null
  }
}

async function fetchAbout(ctx, targetJid) {
  try {
    if (typeof ctx.sock?.fetchStatus !== 'function') return ''
    const result = await ctx.sock.fetchStatus(targetJid)
    const status = Array.isArray(result) ? result[0]?.status : result?.status
    return typeof status === 'string' ? status : ''
  } catch {
    return ''
  }
}

export async function handler(ctx) {
  const parts = String(ctx.text || '').split('|').map((v) => v.trim())
  const hasOverrides = parts.length >= 2 && (parts[0] || parts[1])
  const targetJid = resolveTargetJid(ctx)
  const targetDigits = digitsOf(targetJid)

  const name = (hasOverrides && parts[0]) || (targetJid === ctx.sender ? ctx.pushName : '') || targetDigits
  const number = (hasOverrides && parts[1]) || targetDigits
  let status = parts[2] || ''
  if (!status) status = (await fetchAbout(ctx, targetJid)) || ctx.t('wa-canvas.defaultStatus')

  let buffer
  try {
    const avatarBuffer = await fetchAvatarBuffer(ctx, targetJid)
    buffer = await renderWaProfileCard({
      name,
      number,
      status,
      avatarBuffer,
      labels: {
        profile: ctx.t('wa-canvas.profile'),
        status: ctx.t('wa-canvas.statusLabel'),
        phone: ctx.t('wa-canvas.phoneLabel'),
        footer: ctx.t('wa-canvas.footer'),
      },
    })
  } catch (err) {
    return ctx.reply(ctx.t('wa-canvas.fail', { message: err.message }))
  }

  const caption = ctx.t('wa-canvas.caption', { name, number: formatWaNumber(number), status })
  return ctx.sock.sendMessage(ctx.chat, { image: buffer, caption }, { quoted: ctx.raw })
}
