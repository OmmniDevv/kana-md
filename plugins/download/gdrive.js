import { assertDriveUrl, buildDriveDownloadUrl } from '../../src/scrapers/download/gdrive.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument, MAX_DOCUMENT_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'gdrive',
  limitGroup: 'download',
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
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK GOOGLE DRIVE* 」\n┊ ᴄᴏɴᴛᴏʜ: *.gdrive https://drive.google.com/file/d/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin filenya dari Drive dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL FILE* 」\n┊ Mouu, gagal ambil filenya: *{message}*\n┊ Pastikan linknya publik ya~\n╰━━━━━━━',
      interstitial: '╭─❏ ⚠️ 「 *ADA HALAMAN KONFIRMASI* 」\n┊ Mouu, Google menampilkan halaman konfirmasi unduhan (biasanya karena file besar atau perlu pindai virus), jadi KANA nggak bisa mengambilnya langsung.\n┊ Unduh manual dari link aslinya yaa: *{url}*\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *FILE KEGEDEAN* 」\n┊ Aduh, filenya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 📁 「 *GOOGLE DRIVE* 」\n┊ ꜱᴜᴍʙᴇʀ: *Google Drive*\n╰━━━━━━━',
    },
  },
  en: {
    gdrive: {
      needUrl: '╭─❏ 🔗 「 *SEND THE GOOGLE DRIVE LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.gdrive https://drive.google.com/file/d/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the file from Drive... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH FILE* 」\n┊ Mouu, failed to fetch the file: *{message}*\n┊ Make sure the link is public~\n╰━━━━━━━',
      interstitial: '╭─❏ ⚠️ 「 *CONFIRMATION PAGE SHOWN* 」\n┊ Mouu, Google shows a download confirmation page (usually for large files or virus scanning), so KANA cannot fetch it directly.\n┊ Please download it manually from the original link: *{url}*\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *FILE TOO BIG* 」\n┊ Oops, the file is too big to send over WhatsApp (over *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 📁 「 *GOOGLE DRIVE* 」\n┊ ꜱᴏᴜʀᴄᴇ: *Google Drive*\n╰━━━━━━━',
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

export const test = { input: '.gdrive https://drive.google.com/file/d/1RG3CAPiwiFlFATUlIIwhk0RrbEU4PgVP/view?usp=sharing', expect: /Google Drive/i }

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
