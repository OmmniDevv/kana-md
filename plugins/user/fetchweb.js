import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument } from '../../src/ui/media.js'

// Ambil isi sebuah URL publik: teks pendek ditampilkan langsung,
// sisanya dikirim sebagai berkas teks.
export const config = {
  name: 'fetchweb',
  alias: ['fetch', 'ambilweb'],
  category: 'user',
  description: { id: 'Ambil isi halaman web publik dari URL', en: 'Fetch the content of a public web page from its URL' },
  usage: '.fetchweb <url>',
  example: '.fetchweb https://example.com',
  cooldown: 10,
}

export const i18n = {
  id: {
    fetchweb: {
      hint: '╭─❏ 🌐 「 *AMBIL WEB* 」\n┊ Tulis URL-nya yaa~\n┊ Contoh: *.fetchweb https://example.com*\n╰━━━━━━━',
      caption: '╭─❏ 🌐 「 *ISI WEB* 」\n┊ {url}',
      fail: '╭─❏ ⚠️ 「 *GAGAL AMBIL WEB* 」\n┊ Gagal ambil halamannya: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    fetchweb: {
      hint: '╭─❏ 🌐 「 *FETCH WEB* 」\n┊ Write the URL please~\n┊ Example: *.fetchweb https://example.com*\n╰━━━━━━━',
      caption: '╭─❏ 🌐 「 *WEB CONTENT* 」\n┊ {url}',
      fail: '╭─❏ ⚠️ 「 *FETCH FAILED* 」\n┊ Failed to fetch the page: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.fetchweb', expect: /url/i }

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function handler(ctx) {
  const url = (ctx.text || '').trim().split(/\s+/)[0]
  if (!url || !/^https?:\/\//i.test(url)) return ctx.reply(ctx.t('fetchweb.hint'))
  try {
    const media = await downloadBuffer(url, { maxBytes: 2 * 1024 * 1024 })
    const type = media.contentType ?? ''
    const raw = media.buffer.toString('utf8')
    const text = type.includes('html') ? stripHtml(raw) : raw
    if (text.length <= 3000) return ctx.reply(text || '(kosong)')
    return sendDocument(ctx, Buffer.from(text.slice(0, 100000)), {
      fileName: 'fetchweb.txt',
      caption: ctx.t('fetchweb.caption', { url }),
    })
  } catch (err) {
    return ctx.reply(ctx.t('fetchweb.fail', { error: err.message }))
  }
}
