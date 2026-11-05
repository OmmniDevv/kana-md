import { pinterestSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'

// Album gambar Pinterest: kirim beberapa hasil pencarian teratas.
export const config = {
  name: 'pin',
  alias: ['pins', 'pins2'],
  category: 'search',
  description: { id: 'Cari dan kirim album gambar dari Pinterest', en: 'Search and send an image album from Pinterest' },
  usage: '.pin <kata kunci>',
  example: '.pin wallpaper anime',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    pin: {
      needQuery: '╭─❏ 📌 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.pin wallpaper anime*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TIDAK ADA HASIL* 」\n┊ Mouu, nggak ada pin buat kata kunci itu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian Pinterest gagal: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📌 「 *PINTEREST: {q}* 」\n┊ {sent} ɢᴀᴍʙᴀʀ ᴅᴀʀɪ {total} ʜᴀꜱɪʟ\n╰━━━━━━━',
    },
  },
  en: {
    pin: {
      needQuery: '╭─❏ 📌 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.pin anime wallpaper*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO RESULTS* 」\n┊ Mouu, no pins for those keywords~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, Pinterest search failed: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📌 「 *PINTEREST: {q}* 」\n┊ {sent} ɪᴍᴀɢᴇꜱ ꜰʀᴏᴍ {total} ʀᴇꜱᴜʟᴛꜱ\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pin kucing', expect: /PINTEREST/i }

const MAX_SEND = 5

export async function handler(ctx, { search = pinterestSearch } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('pin.needQuery'))
  let pins
  try {
    pins = await search(q, { limit: 10 })
  } catch (err) {
    return ctx.reply(ctx.t('pin.failed', { message: err.message }))
  }
  const urls = (pins || []).map((p) => p.image).filter(Boolean)
  if (!urls.length) return ctx.reply(ctx.t('pin.notFound'))
  const buffers = []
  for (const url of urls.slice(0, MAX_SEND)) {
    try {
      const { buffer } = await downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 })
      buffers.push(buffer)
    } catch {}
  }
  if (!buffers.length) return ctx.reply(ctx.t('pin.failed', { message: 'semua gambar gagal diunduh' }))
  for (let i = 0; i < buffers.length; i += 1) {
    await sendImage(ctx, buffers[i], {
      caption: i === 0 ? ctx.t('pin.caption', { q, sent: buffers.length, total: urls.length }) : undefined,
    })
  }
  return undefined
}
