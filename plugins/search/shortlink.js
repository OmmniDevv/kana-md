import { assertSafeUrl, retry, withBreaker } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'shortlink',
  alias: ['short', 'shorturl'],
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
      needUrl: '╭─❏ 🔗 「 *PENDEKKAN LINK* 」\n┊ Kirim linknya dulu yaa~\n┊ Contoh: *.shortlink https://example.com*\n╰━━━━━━━',
      invalidUrl: '╭─❏ 🙈 「 *LINK TIDAK VALID* 」\n┊ Mouu, link itu nggak valid atau nggak aman buat dipendekkan~\n┊ Pastikan formatnya lengkap, contoh: *https://example.com/halaman*\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *GAGAL PENDEKKAN LINK* 」\n┊ Mouu, gagal memendekkan link: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      result: '╭─❏ 🔗 「 *LINK PENDEK SIAP* 」\n┊ {short}\n┊ ᴀꜱʟɪ: {original}\n╰━━━━━━━',
      btnQr: 'Buat QR',
    },
  },
  en: {
    shortlink: {
      needUrl: '╭─❏ 🔗 「 *SHORTEN A LINK* 」\n┊ Send the link first~\n┊ Example: *.shortlink https://example.com*\n╰━━━━━━━',
      invalidUrl: '╭─❏ 🙈 「 *INVALID LINK* 」\n┊ Mouu, that link is not valid or not safe to shorten~\n┊ Make sure the format is complete, example: *https://example.com/page*\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *FAILED TO SHORTEN LINK* 」\n┊ Mouu, failed to shorten the link: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      result: '╭─❏ 🔗 「 *SHORT LINK READY* 」\n┊ {short}\n┊ ᴏʀɪɢɪɴᴀʟ: {original}\n╰━━━━━━━',
      btnQr: 'Make QR',
    },
  },
}

export const test = { input: '.shortlink https://omnidevv.vercel.app', expect: /link pendek siap/i }

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
