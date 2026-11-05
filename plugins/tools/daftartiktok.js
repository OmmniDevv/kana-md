export const config = {
  name: 'daftartiktok',
  alias: [],
  category: 'tools',
  description: { id: 'Daftarkan username TikTokmu ke profil KANA (tersimpan lokal di data bot), supaya .cektiktok tanpa argumen langsung mengecek akunmu', en: 'Register your TikTok username to your KANA profile (stored locally in bot data), so .cektiktok without arguments checks your account directly' },
  usage: '.daftartiktok <username>',
  example: '.daftartiktok tiktok',
  cooldown: 3,
}

export const i18n = {
  id: {
    daftartiktok: {
      hint: '╭─❏ 🎵 「 *DAFTAR TIKTOK* 」\n┊ Tulis username TikTokmu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.daftartiktok tiktok*\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *USERNAME TIDAK VALID* 」\n┊ Username TikTok hanya huruf, angka, titik, dan garis bawah yaa~\n╰━━━━━━━',
      saved: '╭─❏ 🎵 「 *TIKTOK TERSIMPAN* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{username}*\n┊ ꜱᴇᴋᴀʀᴀɴɢ *.cektiktok* tanpa argumen bakal ngecek akun ini~\n╰━━━━━━━',
      current: '╭─❏ 🎵 「 *TIKTOK KAMU* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ ᴛᴇʀꜱɪᴍᴘᴀɴ: *@{username}*\n┊ ɢᴀɴᴛɪ ᴅᴇɴɢᴀɴ: *.daftartiktok <username baru>*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal menyimpan: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    daftartiktok: {
      hint: '╭─❏ 🎵 「 *REGISTER TIKTOK* 」\n┊ Write your TikTok username~\n┊ ᴇxᴀᴍᴘʟᴇ: *.daftartiktok tiktok*\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *INVALID USERNAME* 」\n┊ TikTok usernames only use letters, numbers, dots, and underscores~\n╰━━━━━━━',
      saved: '╭─❏ 🎵 「 *TIKTOK SAVED* 」\n┊ ᴜꜱᴇʀɴᴀᴍᴇ: *@{username}*\n┊ ɴᴏᴡ *.cektiktok* without arguments will check this account~\n╰━━━━━━━',
      current: '╭─❏ 🎵 「 *YOUR TIKTOK* 」\n┊ ꜱᴀᴠᴇᴅ ᴜꜱᴇʀɴᴀᴍᴇ: *@{username}*\n┊ ᴄʜᴀɴɢᴇ ɪᴛ ᴡɪᴛʜ: *.daftartiktok <new username>*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to save: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.daftartiktok tiktok', expect: /tersimpan|saved|@tiktok/i }

export async function handler(ctx) {
  const raw = (ctx.text || '').trim().replace(/^@/, '')
  try {
    if (!raw) {
      const saved = await ctx.storage.get('tiktok', ctx.senderDigits).catch(() => null)
      if (saved?.username) return ctx.reply(ctx.t('daftartiktok.current', { username: saved.username }))
      return ctx.reply(ctx.t('daftartiktok.hint'))
    }
    if (!/^[\w.]{2,24}$/.test(raw)) return ctx.reply(ctx.t('daftartiktok.invalid'))
    await ctx.storage.set('tiktok', ctx.senderDigits, { username: raw, name: ctx.pushName || '', savedAt: new Date().toISOString() })
    return ctx.reply(ctx.t('daftartiktok.saved', { username: raw }))
  } catch (err) {
    return ctx.reply(ctx.t('daftartiktok.fail', { message: err.message }))
  }
}
