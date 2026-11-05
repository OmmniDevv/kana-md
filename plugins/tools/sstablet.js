import { getScreenshot } from '../../src/scrapers/search/ssweb.js'
import { sendImage } from '../../src/ui/media.js'

// Screenshot situs tampilan tablet (lebar 768) lewat mesin ssweb
// sehat yang sama (WordPress mShots).
export const config = {
  name: 'sstablet',
  alias: ['sstab', 'screenshottablet'],
  category: 'tools',
  description: { id: 'Screenshot situs tampilan tablet (lebar 768)', en: 'Tablet view website screenshot (768 wide)' },
  usage: '.sstablet <url>',
  example: '.sstablet example.com',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    sstablet: {
      needUrl: '╭─❏ 📱 「 *KIRIM URL SITUSNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.sstablet example.com*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambil screenshot tabletnya... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SCREENSHOT GAGAL* 」\n┊ Mouu, screenshotnya gagal: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📱 「 *SS TABLET* 」\n┊ 🔗 {url}\n╰━━━━━━━',
    },
  },
  en: {
    sstablet: {
      needUrl: '╭─❏ 📱 「 *SEND THE SITE URL* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.sstablet example.com*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is taking the tablet screenshot... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SCREENSHOT FAILED* 」\n┊ Mouu, the screenshot failed: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📱 「 *SS TABLET* 」\n┊ 🔗 {url}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.sstablet example.com', expect: /SS TABLET/ }

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
  if (!url) return ctx.reply(ctx.t('sstablet.needUrl'))
  await ctx.reply(ctx.t('sstablet.working', { mood: ctx.say('mikir') }))
  try {
    const result = await shot(url, { width: 768 })
    await sendImage(ctx, result.buffer, { caption: ctx.t('sstablet.caption', { url: result.targetUrl || url }) })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('sstablet.failed', { message: err.message }))
  }
}
