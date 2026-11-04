import { assertSafeUrl, retry, withBreaker } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'shortlink',
  alias: ['short', 'tinyurl'],
  category: 'search',
  description: { id: 'Pendekkan link panjang lewat TinyURL', en: 'Shorten a long link via TinyURL' },
  usage: '.shortlink <link>',
  example: '.shortlink https://example.com/halaman-yang-panjang',
  cooldown: 5,
  limit: 5,
}

export const i18n = {
  id: {
    shortlink: {
      needUrl: 'Kirim linknya dulu yaa, contoh: .shortlink https://example.com~',
      invalidUrl: 'Mouu, link itu nggak valid atau nggak aman buat dipendekkan. Pastikan formatnya lengkap, contoh: https://example.com/halaman~',
      failed: 'Mouu, gagal memendekkan link: {message}. Coba lagi nanti ya~',
      result: 'Link pendeknya siap: {short}\nAsli: {original}',
      btnQr: 'Buat QR',
    },
  },
  en: {
    shortlink: {
      needUrl: 'Send the link first, example: .shortlink https://example.com~',
      invalidUrl: 'Mouu, that link is not valid or not safe to shorten. Make sure the format is complete, example: https://example.com/page~',
      failed: 'Mouu, failed to shorten the link: {message}. Try again later~',
      result: 'Your short link is ready: {short}\nOriginal: {original}',
      btnQr: 'Make QR',
    },
  },
}

export const test = { input: '.shortlink https://omnidevv.vercel.app', expect: /Link pendeknya siap/i }

export async function handler(ctx) {
  const raw = ctx.args[0]
  if (!raw) return ctx.reply(ctx.t('shortlink.needUrl'))
  let url
  try {
    url = assertSafeUrl(raw)
  } catch {
    return ctx.reply(ctx.t('shortlink.invalidUrl'))
  }
  let short
  try {
    short = await withBreaker('tinyurl', () =>
      retry(async () => {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url.href)}`, {
          signal: AbortSignal.timeout(20000),
        })
        if (!res.ok) throw new Error(`TinyURL balas HTTP ${res.status}`)
        const text = (await res.text()).trim()
        if (!/^https?:\/\/\S+$/.test(text)) throw new Error('TinyURL membalas hasil yang tidak dikenal')
        return text
      })
    )
  } catch (err) {
    return ctx.reply(ctx.t('shortlink.failed', { message: err.message }))
  }
  const body = ctx.t('shortlink.result', { short, original: url.href })
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('shortlink.btnQr'), id: `.qr ${short}` }],
    textFallback: body,
  })
}
