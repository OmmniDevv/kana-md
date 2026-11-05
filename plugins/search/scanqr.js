import { readQr } from '../../src/scrapers/search/qr.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'scanqr',
  alias: ['bacaqr'],
  category: 'search',
  description: { id: 'Baca isi QR code dari gambar yang dikutip', en: 'Read a QR code from a quoted image' },
  usage: '.scanqr (balas gambar berisi QR)',
  example: '.scanqr',
  cooldown: 5,
  limit: 5,
}

export const i18n = {
  id: {
    scanqr: {
      noImage: '╭─❏ 🔍 「 *SCAN QR* 」\n┊ Balas atau kutip gambar yang ada QR-nya dulu yaa~\n┊ Baru ketik *.scanqr*\n╰━━━━━━━',
      notFound: '╭─❏ 🙈 「 *QR TIDAK KEBACA* 」\n┊ Mouu, QR-nya nggak kebaca dari gambar itu~\n┊ Coba gambar yang lebih jernih dan QR-nya utuh yaa~\n╰━━━━━━━',
      result: '╭─❏ 🔍 「 *ISI QR* 」\n┊ {content}\n╰━━━━━━━',
      btnQr: 'Buat QR lagi',
      btnShort: 'Pendekkan link',
    },
  },
  en: {
    scanqr: {
      noImage: '╭─❏ 🔍 「 *SCAN QR* 」\n┊ Reply to or quote an image containing a QR first~\n┊ Then type *.scanqr*\n╰━━━━━━━',
      notFound: '╭─❏ 🙈 「 *QR NOT READABLE* 」\n┊ Mouu, the QR could not be read from that image~\n┊ Try a clearer image with the full QR visible~\n╰━━━━━━━',
      result: '╭─❏ 🔍 「 *QR CONTENT* 」\n┊ {content}\n╰━━━━━━━',
      btnQr: 'Make this QR',
      btnShort: 'Shorten link',
    },
  },
}

async function getImageBuffer(ctx) {
  const attempts = []
  if (ctx.quoted) attempts.push(() => ctx.downloadQuoted())
  attempts.push(() => ctx.downloadMedia())
  for (const attempt of attempts) {
    try {
      const result = await attempt()
      const buffer = Buffer.isBuffer(result) ? result : result?.buffer
      if (buffer && buffer.length) return buffer
    } catch {
      // coba cara berikutnya
    }
  }
  return null
}

export const test = { input: '.scanqr', expect: /QR/i }

export async function handler(ctx) {
  const buffer = await getImageBuffer(ctx)
  if (!buffer) return ctx.reply(ctx.t('scanqr.noImage'))
  const content = readQr(buffer)
  if (!content) return ctx.reply(ctx.t('scanqr.notFound'))
  const body = ctx.t('scanqr.result', { content })
  const replies = []
  if (content.length <= 60 && !/^https?:\/\//i.test(content)) {
    replies.push({ text: ctx.t('scanqr.btnQr'), id: `.qr ${content}` })
  }
  if (/^https?:\/\/\S+$/i.test(content)) {
    replies.push({ text: ctx.t('scanqr.btnShort'), id: `.shortlink ${content}` })
  }
  if (replies.length) {
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  return ctx.reply(body)
}
