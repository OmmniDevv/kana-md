import { pinterestSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'pinterest',
  alias: ['pin', 'pindl', 'pinsearch', 'pinterestsearch', 'pindl2'],
  category: 'download',
  description: { id: 'Cari gambar di Pinterest dan kirim hasil teratas', en: 'Search Pinterest images and send the top result' },
  usage: '.pinterest <kata kunci>',
  example: '.pinterest anime wallpaper',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    pinterest: {
      needQuery: '╭─❏ 🔍 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.pinterest anime wallpaper*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *GAMBAR TIDAK KETEMU* 」\n┊ Mouu, nggak ada gambar buat kata kunci itu. Coba kata lain ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian Pinterest gagal: *{message}*\n┊ Sumbernya kadang ngambek, coba lagi nanti ya~\n╰━━━━━━━',
      caption: '╭─❏ 📌 「 *PINTEREST* 」\n┊ *{title}*\n╰━━━━━━━',
      moreHeader: '╭─❏ 📌 「 *HASIL PINTEREST* 」\n┊ ᴋᴀᴛᴀ ᴋᴜɴᴄɪ: *{query}*',
      item: '┊ {n}. *{title}*\n┊ {url}',
      btnAgain: 'Cari lagi',
      btnImages: 'Cari di web',
      followUp: 'ᴄᴀʀɪ ʟᴀɢɪ: *.pinterest {query}* • *.gambar {query}*',
    },
  },
  en: {
    pinterest: {
      needQuery: '╭─❏ 🔍 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.pinterest anime wallpaper*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO IMAGES FOUND* 」\n┊ Mouu, no images for those keywords. Try others~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, Pinterest search failed: *{message}*\n┊ The source acts up sometimes, try again later~\n╰━━━━━━━',
      caption: '╭─❏ 📌 「 *PINTEREST* 」\n┊ *{title}*\n╰━━━━━━━',
      moreHeader: '╭─❏ 📌 「 *PINTEREST RESULTS* 」\n┊ ᴋᴇʏᴡᴏʀᴅꜱ: *{query}*',
      item: '┊ {n}. *{title}*\n┊ {url}',
      btnAgain: 'Search again',
      btnImages: 'Search the web',
      followUp: 'ꜱᴇᴀʀᴄʜ ᴀɢᴀɪɴ: *.pinterest {query}* • *.gambar {query}*',
    },
  },
}

export const test = { input: '.pinterest kucing lucu', expect: /kucing/i }

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('pinterest.needQuery'))
  let search
  try {
    search = await pinterestSearch(query, { limit: 5 })
  } catch (err) {
    return ctx.reply(ctx.t('pinterest.failed', { message: err.message }))
  }
  const withImage = search.results.filter((pin) => pin.image)
  if (!withImage.length) return ctx.reply(ctx.t('pinterest.notFound'))
  const first = withImage[0]
  try {
    const media = await downloadBuffer(first.image, { maxBytes: MAX_IMAGE_BYTES })
    await sendImage(ctx, media.buffer, { caption: ctx.t('pinterest.caption', { title: first.title || query }) })
  } catch (err) {
    return ctx.reply(ctx.t('pinterest.failed', { message: err.message }))
  }
  const lines = [ctx.t('pinterest.moreHeader', { query })]
  if (withImage.length > 1) {
    withImage.slice(1).forEach((pin, i) => {
      lines.push(ctx.t('pinterest.item', { n: i + 2, title: pin.title || '-', url: pin.url }))
    })
  }
  lines.push('╰━━━━━━━')
  lines.push(ctx.t('pinterest.followUp', { query }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('pinterest.btnAgain'), id: `.pinterest ${query}` },
      { text: ctx.t('pinterest.btnImages'), id: `.gambar ${query}` },
    ],
    textFallback: body,
  })
}
