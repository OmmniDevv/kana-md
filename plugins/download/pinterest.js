import { pinterestSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'pinterest',
  alias: ['pin'],
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
      needQuery: 'Ketik kata kuncinya dulu yaa, contoh: .pinterest anime wallpaper~',
      notFound: 'Mouu, nggak ada gambar buat kata kunci itu. Coba kata lain ya~',
      failed: 'Mouu, pencarian Pinterest gagal: {message}. Sumbernya kadang ngambek, coba lagi nanti ya~',
      caption: '{title}',
      moreHeader: 'Hasil lain buat "{query}":',
      item: '{n}. {title}\n{url}',
      btnAgain: 'Cari lagi',
      btnImages: 'Cari di web',
      btnMenu: 'Menu unduhan',
      followUp: 'Lanjutan: .pinterest {query} • .gambar {query} • .menu download',
    },
  },
  en: {
    pinterest: {
      needQuery: 'Type the keywords first, example: .pinterest anime wallpaper~',
      notFound: 'Mouu, no images for those keywords. Try others~',
      failed: 'Mouu, Pinterest search failed: {message}. The source acts up sometimes, try again later~',
      caption: '{title}',
      moreHeader: 'More results for "{query}":',
      item: '{n}. {title}\n{url}',
      btnAgain: 'Search again',
      btnImages: 'Search the web',
      btnMenu: 'Download menu',
      followUp: 'Next: .pinterest {query} • .gambar {query} • .menu download',
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
  const lines = []
  if (withImage.length > 1) {
    lines.push(ctx.t('pinterest.moreHeader', { query }))
    withImage.slice(1).forEach((pin, i) => {
      lines.push(ctx.t('pinterest.item', { n: i + 2, title: pin.title || '-', url: pin.url }))
    })
  }
  lines.push(ctx.t('pinterest.followUp', { query }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('pinterest.btnAgain'), id: `.pinterest ${query}` },
      { text: ctx.t('pinterest.btnImages'), id: `.gambar ${query}` },
      { text: ctx.t('pinterest.btnMenu'), id: '.menu download' },
    ],
    textFallback: body,
  })
}
