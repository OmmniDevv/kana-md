import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'listpc',
  alias: [],
  category: 'owner',
  description: { id: 'Daftar chat pribadi (user) yang tercatat di database bot, urut aktivitas terakhir', en: 'List of private chats (users) recorded in the bot database, sorted by last activity' },
  usage: '.listpc',
  example: '.listpc',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    listpc: {
      header: '╭─❏ 📱 「 *CHAT PRIBADI TERCATAT ({count})* 」',
      row: '┊ {index}. *{name}* ({digits})\n┊    {status} · terakhir aktif {seen}',
      more: '┊ …dan {rest} user lainnya',
      footer: '╰━━━━━━━',
      empty: '╭─❏ 📱 「 *CHAT PRIBADI* 」\n┊ Belum ada user tercatat di database bot~\n╰━━━━━━━',
      registered: 'terdaftar',
      unregistered: 'belum daftar',
      unknownSeen: 'tidak diketahui',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    listpc: {
      header: '╭─❏ 📱 「 *RECORDED PRIVATE CHATS ({count})* 」',
      row: '┊ {index}. *{name}* ({digits})\n┊    {status} · last active {seen}',
      more: '┊ …and {rest} more users',
      footer: '╰━━━━━━━',
      empty: '╭─❏ 📱 「 *PRIVATE CHATS* 」\n┊ No users recorded in the bot database yet~\n╰━━━━━━━',
      registered: 'registered',
      unregistered: 'not registered',
      unknownSeen: 'unknown',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.listpc', expect: /chat pribadi|private chat/i }

const MAX_ROWS = 30

// Kunci storage users adalah digit dari JID pengirim. Di mode pengalamatan
// LID, digit itu bisa berupa LID, bukan nomor telepon (kasus owner tampil
// sebagai 121693670506723 padahal nomornya 6285869074622). Resolusi hanya
// dari store pemetaan LID sesi sendiri lewat library:
// sock.signalRepository.lidMapping.getPNForLID('<digit>@lid') membalas JID
// nomor telepon atau null. Tanpa pemetaan yang dikenal, digit ditampilkan
// apa adanya; tidak ada angka yang dikarang.
export async function resolveDisplayDigits(ctx, digits) {
  const lidMapping = ctx?.sock?.signalRepository?.lidMapping
  if (!lidMapping || typeof lidMapping.getPNForLID !== 'function') return digits
  try {
    const pn = await lidMapping.getPNForLID(`${digits}@lid`)
    const pnDigits = String(pn ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
    return pnDigits && pnDigits !== digits ? pnDigits : digits
  } catch {
    return digits
  }
}

export async function handler(ctx) {
  try {
    const keys = (await ctx.storage.keys('users')).filter((k) => /^\d+$/.test(k))
    if (!keys.length) return ctx.reply(ctx.t('listpc.empty'))
    const rows = []
    for (const digits of keys) {
      const profile = await getProfile(ctx.storage, digits)
      rows.push({ digits, profile })
    }
    rows.sort((a, b) => (b.profile.lastSeen || 0) - (a.profile.lastSeen || 0))
    const lines = [ctx.t('listpc.header', { count: rows.length })]
    const shown = rows.slice(0, MAX_ROWS)
    for (let i = 0; i < shown.length; i++) {
      const row = shown[i]
      const seen = row.profile.lastSeen
        ? new Date(row.profile.lastSeen).toLocaleString(ctx.lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta' })
        : ctx.t('listpc.unknownSeen')
      lines.push(ctx.t('listpc.row', {
        index: i + 1,
        name: row.profile.regName || row.profile.name || row.digits,
        digits: await resolveDisplayDigits(ctx, row.digits),
        status: row.profile.registered ? ctx.t('listpc.registered') : ctx.t('listpc.unregistered'),
        seen,
      }))
    }
    if (rows.length > MAX_ROWS) lines.push(ctx.t('listpc.more', { rest: rows.length - MAX_ROWS }))
    lines.push(ctx.t('listpc.footer'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('listpc.fail', { error: err.message }))
  }
}
