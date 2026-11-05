import { getScreenshot } from '../../src/scrapers/search/ssweb.js'
import { sendImage } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ssweb',
  premium: true,
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
      needUrl: '╭─❏ 📸 「 *SCREENSHOT WEB* 」\n┊ Kirim link webnya dulu yaa~\n┊ Contoh: *.ssweb https://example.com*\n╰━━━━━━━',
      invalidUrl: '╭─❏ 🙈 「 *LINK TIDAK VALID* 」\n┊ Mouu, link itu nggak valid atau nggak aman~\n┊ Pastikan formatnya lengkap yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SCREENSHOT GAGAL* 」\n┊ Mouu, screenshot-nya gagal: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      caption: '╭─❏ 📸 「 *SCREENSHOT* 」\n┊ {url}\n╰━━━━━━━',
      hint: '╭─❏ 💡 「 *CATATAN* 」\n┊ Kalau gambarnya masih bertuliskan *Generating Preview*, itu tandanya layanan screenshot lagi menyiapkan tampilannya~\n┊ Tunggu sebentar lalu coba lagi yaa~\n╰━━━━━━━',
      btnAgain: 'Ambil lagi',
      btnShort: 'Pendekkan link',
    },
  },
  en: {
    ssweb: {
      needUrl: '╭─❏ 📸 「 *WEB SCREENSHOT* 」\n┊ Send the web link first~\n┊ Example: *.ssweb https://example.com*\n╰━━━━━━━',
      invalidUrl: '╭─❏ 🙈 「 *INVALID LINK* 」\n┊ Mouu, that link is not valid or not safe~\n┊ Make sure the format is complete~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SCREENSHOT FAILED* 」\n┊ Mouu, the screenshot failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      caption: '╭─❏ 📸 「 *SCREENSHOT* 」\n┊ {url}\n╰━━━━━━━',
      hint: '╭─❏ 💡 「 *NOTE* 」\n┊ If the image still says *Generating Preview*, the screenshot service is preparing the view~\n┊ Wait a bit and try again~\n╰━━━━━━━',
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
