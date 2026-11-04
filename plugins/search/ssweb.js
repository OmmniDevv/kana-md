import { getScreenshot } from '../../src/scrapers/search/ssweb.js'
import { sendImage } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ssweb',
  alias: ['screenshot', 'ss'],
  category: 'search',
  description: { id: 'Ambil screenshot halaman web', en: 'Take a screenshot of a web page' },
  usage: '.ssweb <link web>',
  example: '.ssweb https://example.com',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    ssweb: {
      needUrl: 'Kirim link webnya dulu yaa, contoh: .ssweb https://example.com~',
      invalidUrl: 'Mouu, link itu nggak valid atau nggak aman. Pastikan formatnya lengkap yaa~',
      failed: 'Mouu, screenshot-nya gagal: {message}. Coba lagi nanti ya~',
      caption: 'Screenshot {url}',
      hint: 'Catatan: kalau gambarnya masih bertuliskan Generating Preview, itu tandanya layanan screenshot lagi menyiapkan tampilannya. Tunggu sebentar lalu coba lagi yaa~',
      btnAgain: 'Ambil lagi',
      btnShort: 'Pendekkan link',
    },
  },
  en: {
    ssweb: {
      needUrl: 'Send the web link first, example: .ssweb https://example.com~',
      invalidUrl: 'Mouu, that link is not valid or not safe. Make sure the format is complete~',
      failed: 'Mouu, the screenshot failed: {message}. Try again later~',
      caption: 'Screenshot of {url}',
      hint: 'Note: if the image still says Generating Preview, the screenshot service is preparing the view. Wait a bit and try again~',
      btnAgain: 'Take again',
      btnShort: 'Shorten link',
    },
  },
}

export const test = { input: '.ssweb https://omnidevv.vercel.app', expect: /Screenshot/i }

export async function handler(ctx) {
  const raw = ctx.args[0]
  if (!raw) return ctx.reply(ctx.t('ssweb.needUrl'))
  let shot
  try {
    shot = await getScreenshot(raw)
  } catch (err) {
    if (/tidak valid|http atau https|tidak diizinkan|privat/i.test(err.message)) {
      return ctx.reply(ctx.t('ssweb.invalidUrl'))
    }
    return ctx.reply(ctx.t('ssweb.failed', { message: err.message }))
  }
  await sendImage(ctx, shot.buffer, { caption: ctx.t('ssweb.caption', { url: shot.target }) })
  const hint = ctx.t('ssweb.hint')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body: hint,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('ssweb.btnAgain'), id: `.ssweb ${shot.target}` },
      { text: ctx.t('ssweb.btnShort'), id: `.shortlink ${shot.target}` },
    ],
    textFallback: hint,
  })
}
