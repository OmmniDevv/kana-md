import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendSticker } from '../maker/sticker.js'

// Ubah emoji menjadi stiker animasi Noto Emoji resmi Google
// (fonts.gstatic.com/s/e/notoemoji). Terverifikasi 2026-11-05: berkas
// webp animasi menjawab dengan header RIFF WEBP ANIM.
export const config = {
  name: 'emojitoanimasi',
  alias: ['emojianim', 'animemoji'],
  category: 'tools',
  description: { id: 'Ubah emoji menjadi stiker animasi Noto Emoji', en: 'Turn an emoji into an animated Noto Emoji sticker' },
  usage: '.emojitoanimasi <emoji>',
  example: '.emojitoanimasi 😀',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    emojitoanimasi: {
      needEmoji: '╭─❏ 😀 「 *KIRIM EMOJINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.emojitoanimasi 😀*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *ANIMASI TIDAK TERSEDIA* 」\n┊ Mouu, emoji itu belum punya versi animasi Noto~\n┊ Coba emoji wajah atau hati yang umum ya.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL ANIMASI* 」\n┊ Mouu, gagal ambil animasinya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 😀 「 *EMOJI ANIMASI* 」\n┊ ɴɪʜ ꜱᴛɪᴋᴇʀ ᴀɴɪᴍᴀꜱɪɴʏᴀ~\n╰━━━━━━━',
    },
  },
  en: {
    emojitoanimasi: {
      needEmoji: '╭─❏ 😀 「 *SEND THE EMOJI* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.emojitoanimasi 😀*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO ANIMATION AVAILABLE* 」\n┊ Mouu, that emoji has no Noto animated version yet~\n┊ Try a common face or heart emoji.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH* 」\n┊ Mouu, failed to fetch the animation: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 😀 「 *ANIMATED EMOJI* 」\n┊ ʜᴇʀᴇ ɪꜱ ᴛʜᴇ ᴀɴɪᴍᴀᴛᴇᴅ ꜱᴛɪᴄᴋᴇʀ~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.emojitoanimasi 😀', expect: /EMOJI ANIMASI|ANIMATED EMOJI/ }

// Bangun URL webp animasi Noto dari emoji pertama pada teks.
export function notoAnimatedUrl(text) {
  const chars = [...String(text || '').trim()]
  if (!chars.length) return null
  const emoji = chars[0] === '❤' || chars.length === 1 ? chars.join('') : chars[0]
  const first = [...(emoji || '')]
  if (!first.length) return null
  // Noto memakai urutan codepoint heksadesimal digabung garis bawah,
  // tanpa pemilih variasi FE0F.
  const cps = []
  for (const ch of String(text).trim()) {
    const cp = ch.codePointAt(0).toString(16)
    if (cp === 'fe0f') continue
    cps.push(cp)
    if (cps.length >= 8) break
  }
  if (!cps.length) return null
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${cps.join('_')}/512.webp`
}

export function isAnimatedWebp(buffer) {
  return Buffer.isBuffer(buffer)
    && buffer.length > 20
    && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP'
}

export async function handler(ctx) {
  const url = notoAnimatedUrl(ctx.text || '')
  if (!url) return ctx.reply(ctx.t('emojitoanimasi.needEmoji'))
  let buffer
  try {
    ;({ buffer } = await downloadBuffer(url, { maxBytes: 4 * 1024 * 1024, timeout: 20000 }))
  } catch {
    return ctx.reply(ctx.t('emojitoanimasi.notFound'))
  }
  if (!isAnimatedWebp(buffer)) return ctx.reply(ctx.t('emojitoanimasi.notFound'))
  try {
    await sendSticker(ctx, buffer)
  } catch (err) {
    return ctx.reply(ctx.t('emojitoanimasi.failed', { message: err.message }))
  }
  return ctx.reply(ctx.t('emojitoanimasi.caption'))
}
