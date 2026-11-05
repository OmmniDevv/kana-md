import { getScreenshot } from '../../src/scrapers/search/ssweb.js'
import { sendImage } from '../../src/ui/media.js'

// Screenshot situs tampilan desktop (lebar 1280) lewat mesin ssweb
// sehat yang sama (WordPress mShots).
export const config = {
  name: 'ssdesktop',
  alias: ['sspc', 'screenshotdesktop'],
  category: 'tools',
  description: { id: 'Screenshot situs tampilan desktop (lebar 1280)', en: 'Desktop view website screenshot (1280 wide)' },
  usage: '.ssdesktop <url>',
  example: '.ssdesktop example.com',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    ssdesktop: {
      needUrl: '╭─❏ 🖥️ 「 *KIRIM URL SITUSNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.ssdesktop example.com*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambil screenshot desktopnya... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SCREENSHOT GAGAL* 」\n┊ Mouu, screenshotnya gagal: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🖥️ 「 *SS DESKTOP* 」\n┊ 🔗 {url}\n╰━━━━━━━',
    },
  },
  en: {
    ssdesktop: {
      needUrl: '╭─❏ 🖥️ 「 *SEND THE SITE URL* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.ssdesktop example.com*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is taking the desktop screenshot... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SCREENSHOT FAILED* 」\n┊ Mouu, the screenshot failed: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🖥️ 「 *SS DESKTOP* 」\n┊ 🔗 {url}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ssdesktop example.com', expect: /SS DESKTOP/ }

function normalizeUrl(text) {
  const src = (text || '').trim().split(/\s+/)[0]
  if (!src) return null
  const withProto = /^https?:\/\//i.test(src) ? src : 'https://' + src
  try {
    const u = new URL(withProto)
    return u.hostname.includes('.') ? u.href : null
  } catch { return null }
}

export async function handler(ctx, { shot = getScreenshot } = {}) {
  const url = normalizeUrl(ctx.text || '')
  if (!url) return ctx.reply(ctx.t('ssdesktop.needUrl'))
  await ctx.reply(ctx.t('ssdesktop.working', { mood: ctx.say('mikir') }))
  try {
    const result = await shot(url, { width: 1280 })
    await sendImage(ctx, result.buffer, { caption: ctx.t('ssdesktop.caption', { url: result.targetUrl || url }) })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('ssdesktop.failed', { message: err.message }))
  }
}
