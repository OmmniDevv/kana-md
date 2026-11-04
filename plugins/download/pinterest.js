import { pinterestSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'

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
    },
  },
}

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
  if (withImage.length > 1) {
    const lines = [ctx.t('pinterest.moreHeader', { query })]
    withImage.slice(1).forEach((pin, i) => {
      lines.push(ctx.t('pinterest.item', { n: i + 2, title: pin.title || '-', url: pin.url }))
    })
    await ctx.reply(lines.join('\n'))
  }
}
