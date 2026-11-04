import { resolveMediafire } from '../../src/scrapers/download/mediafire.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument, MAX_DOCUMENT_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'mediafire',
  alias: ['mf'],
  category: 'download',
  description: { id: 'Unduh file dari link MediaFire', en: 'Download a file from a MediaFire link' },
  usage: '.mediafire <link mediafire>',
  example: '.mediafire https://www.mediafire.com/file/xxxx/file.zip/file',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    mediafire: {
      needUrl: 'Kirim link MediaFire-nya dulu yaa, contoh: .mediafire https://www.mediafire.com/file/...~',
      working: 'Sebentar, KANA ambilin filenya dari MediaFire dulu... {mood}',
      failed: 'Mouu, gagal ambil filenya: {message}. Pastikan linknya benar dan filenya masih ada ya~',
      tooBig: 'Aduh, filenya kegedean buat dikirim lewat WhatsApp (di atas 64 MB)~',
      caption: '{fileName}',
    },
  },
  en: {
    mediafire: {
      needUrl: 'Send the MediaFire link first, example: .mediafire https://www.mediafire.com/file/...~',
      working: 'One sec, KANA is fetching the file from MediaFire... {mood}',
      failed: 'Mouu, failed to fetch the file: {message}. Make sure the link is correct and the file still exists~',
      tooBig: 'Oops, the file is too big to send over WhatsApp (over 64 MB)~',
      caption: '{fileName}',
    },
  },
}

export async function handler(ctx) {
  const raw = ctx.args[0]
  if (!raw) return ctx.reply(ctx.t('mediafire.needUrl'))
  await ctx.reply(ctx.t('mediafire.working', { mood: ctx.say('mikir') }))
  let resolved
  let media
  try {
    resolved = await resolveMediafire(raw)
    media = await downloadBuffer(resolved.directUrl, { maxBytes: MAX_DOCUMENT_BYTES, timeout: 120000 })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('mediafire.tooBig'))
    return ctx.reply(ctx.t('mediafire.failed', { message: err.message }))
  }
  await sendDocument(ctx, media.buffer, {
    fileName: resolved.fileName,
    mimetype: media.contentType || undefined,
    caption: ctx.t('mediafire.caption', { fileName: resolved.fileName }),
  })
}
