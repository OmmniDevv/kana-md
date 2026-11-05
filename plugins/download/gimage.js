import { searchImages } from '../../src/scrapers/search/gambar.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'gimage',
  alias: ['googleimage', 'carigambar'],
  category: 'download',
  description: { id: 'Cari gambar dari web dan kirim hasil teratasnya', en: 'Search images from the web and send the top results' },
  usage: '.gimage <kata kunci>',
  example: '.gimage kucing oren',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    gimage: {
      needQuery: '╭─❏ 🖼️ 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.gimage kucing oren*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA cariin gambarnya dulu... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TIDAK ADA HASIL* 」\n┊ Mouu, nggak ada gambar buat kata kunci itu. Coba kata lain ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian gambar gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *GAMBAR: {query}* 」\n┊ ʜᴀꜱɪʟ {n} ᴅᴀʀɪ ᴘᴇɴᴄᴀʀɪᴀɴ ᴡᴇʙ (ʙɪɴɢ)\n╰━━━━━━━',
    },
  },
  en: {
    gimage: {
      needQuery: '╭─❏ 🖼️ 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.gimage orange cat*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is looking for the images... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO RESULTS* 」\n┊ Mouu, no images for those keywords. Try others~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, image search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *IMAGE: {query}* 」\n┊ ʀᴇꜱᴜʟᴛ {n} ꜰʀᴏᴍ ᴡᴇʙ ꜱᴇᴀʀᴄʜ (ʙɪɴɢ)\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.gimage kucing', expect: /GAMBAR|IMAGE/ }

const MAX_SEND = 4

export async function handler(ctx) {
  const query = (ctx.text || '').trim()
  if (!query) return ctx.reply(ctx.t('gimage.needQuery'))
  await ctx.reply(ctx.t('gimage.working', { mood: ctx.say('mikir') }))
  let search
  try {
    search = await searchImages(query, { limit: 8 })
  } catch (err) {
    return ctx.reply(ctx.t('gimage.failed', { message: err.message }))
  }
  const urls = (search.results || []).filter(Boolean)
  if (!urls.length) return ctx.reply(ctx.t('gimage.notFound'))
  let sent = 0
  for (const url of urls) {
    if (sent >= MAX_SEND) break
    try {
      const { buffer } = await downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 })
      await sendImage(ctx, buffer, {
        caption: sent === 0 ? ctx.t('gimage.caption', { query, n: urls.length }) : undefined,
      })
      sent += 1
    } catch {
      // Lewati gambar yang gagal diunduh, lanjut ke hasil berikutnya.
    }
  }
  if (!sent) return ctx.reply(ctx.t('gimage.failed', { message: 'semua gambar gagal diunduh' }))
  return undefined
}
