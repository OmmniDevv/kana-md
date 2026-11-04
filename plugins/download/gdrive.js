import { assertDriveUrl, buildDriveDownloadUrl } from '../../src/scrapers/download/gdrive.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument, MAX_DOCUMENT_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'gdrive',
  alias: ['drive', 'googledrive'],
  category: 'download',
  description: { id: 'Unduh file dari link Google Drive publik', en: 'Download a file from a public Google Drive link' },
  usage: '.gdrive <link drive>',
  example: '.gdrive https://drive.google.com/file/d/xxxx/view',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    gdrive: {
      needUrl: 'Kirim link Google Drive-nya dulu yaa, contoh: .gdrive https://drive.google.com/file/d/...~',
      working: 'Sebentar, KANA ambilin filenya dari Drive dulu... {mood}',
      failed: 'Mouu, gagal ambil filenya: {message}. Pastikan linknya publik ya~',
      interstitial: 'Mouu, Google menampilkan halaman konfirmasi unduhan (biasanya karena file besar atau perlu pindai virus), jadi KANA nggak bisa mengambilnya langsung. Unduh manual dari link aslinya yaa: {url}',
      tooBig: 'Aduh, filenya kegedean buat dikirim lewat WhatsApp (di atas 64 MB)~',
      caption: 'File dari Google Drive',
    },
  },
  en: {
    gdrive: {
      needUrl: 'Send the Google Drive link first, example: .gdrive https://drive.google.com/file/d/...~',
      working: 'One sec, KANA is fetching the file from Drive... {mood}',
      failed: 'Mouu, failed to fetch the file: {message}. Make sure the link is public~',
      interstitial: 'Mouu, Google shows a download confirmation page (usually for large files or virus scanning), so KANA cannot fetch it directly. Please download it manually from the original link: {url}',
      tooBig: 'Oops, the file is too big to send over WhatsApp (over 64 MB)~',
      caption: 'File from Google Drive',
    },
  },
}

const EXT_BY_TYPE = {
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'text/plain': 'txt',
}

export async function handler(ctx) {
  const raw = ctx.args[0]
  if (!raw) return ctx.reply(ctx.t('gdrive.needUrl'))
  let id
  try {
    id = assertDriveUrl(raw).id
  } catch (err) {
    return ctx.reply(ctx.t('gdrive.failed', { message: err.message }))
  }
  await ctx.reply(ctx.t('gdrive.working', { mood: ctx.say('mikir') }))
  let media
  try {
    media = await downloadBuffer(buildDriveDownloadUrl(id), { maxBytes: MAX_DOCUMENT_BYTES, timeout: 120000 })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('gdrive.tooBig'))
    return ctx.reply(ctx.t('gdrive.failed', { message: err.message }))
  }
  if ((media.contentType || '').includes('text/html')) {
    return ctx.reply(ctx.t('gdrive.interstitial', { url: raw }))
  }
  const ext = EXT_BY_TYPE[(media.contentType || '').split(';')[0].trim()] || 'bin'
  await sendDocument(ctx, media.buffer, {
    fileName: `gdrive-${id.slice(0, 8)}.${ext}`,
    mimetype: media.contentType || undefined,
    caption: ctx.t('gdrive.caption'),
  })
}
