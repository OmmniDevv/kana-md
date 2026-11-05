import { robloxUserDetail } from '../../src/scrapers/kindb/roblox.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'robloxplayer',
  alias: [],
  category: 'search',
  description: { id: 'Cari profil pemain Roblox dari API resmi Roblox: ID, nama tampilan, tanggal bergabung, dan avatar', en: 'Look up a Roblox player profile from the official Roblox API: ID, display name, join date, and avatar' },
  usage: '.robloxplayer <username>',
  example: '.robloxplayer builderman',
  cooldown: 8,
}

export const i18n = {
  id: {
    robloxplayer: {
      hint: '╭─❏ 🧱 「 *PEMAIN ROBLOX* 」\n┊ Tulis username Robloxnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.robloxplayer builderman*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, pemain *{q}* tidak ketemu di Roblox~\n┊ Coba username lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian pemain Roblox gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 🧱 「 *{name}* 」\n┊ ɴᴀᴍᴀ ᴛᴀᴍᴘɪʟᴀɴ: *{display}*\n┊ ɪᴅ: *{id}*\n┊ ʙᴇʀɢᴀʙᴜɴɢ: *{created}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ʙɪᴏ: {bio}\n┊ ᴘʀᴏꜰɪʟ: {url}\n╰━━━━━━━',
      active: 'Aktif',
      banned: 'Banned',
      noBio: '(kosong)',
    },
  },
  en: {
    robloxplayer: {
      hint: '╭─❏ 🧱 「 *ROBLOX PLAYER* 」\n┊ Write the Roblox username first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.robloxplayer builderman*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, player *{q}* was not found on Roblox~\n┊ Try another username~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, Roblox player search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 🧱 「 *{name}* 」\n┊ ᴅɪꜱᴘʟᴀʏ ɴᴀᴍᴇ: *{display}*\n┊ ɪᴅ: *{id}*\n┊ ᴊᴏɪɴᴇᴅ: *{created}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ʙɪᴏ: {bio}\n┊ ᴘʀᴏꜰɪʟᴇ: {url}\n╰━━━━━━━',
      active: 'Active',
      banned: 'Banned',
      noBio: '(empty)',
    },
  },
}

export const test = { input: '.robloxplayer builderman', expect: /ɪᴅ: \*156\*/ }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('robloxplayer.hint'))
  try {
    const user = await robloxUserDetail(q)
    if (!user) return ctx.reply(ctx.t('robloxplayer.notfound', { q }))
    const card = ctx.t('robloxplayer.card', {
      name: user.name,
      display: user.displayName,
      id: user.id,
      created: user.created,
      status: user.banned ? ctx.t('robloxplayer.banned') : ctx.t('robloxplayer.active'),
      bio: user.description || ctx.t('robloxplayer.noBio'),
      url: user.url,
    })
    if (user.headshot) {
      try {
        const buf = (await downloadBuffer(user.headshot, { maxBytes: 2 * 1024 * 1024 })).buffer
        return await sendImage(ctx, buf, { caption: card })
      } catch { /* avatar gagal: kirim teks saja */ }
    }
    return ctx.reply(card)
  } catch (err) {
    return ctx.reply(ctx.t('robloxplayer.fail', { message: err.message }))
  }
}
