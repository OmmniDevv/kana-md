import { uploadToUguu } from '../../src/scrapers/tools/upload.js'
import { fetchSourceMedia } from '../maker/sticker.js'
import { MAX_DOCUMENT_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'upload',
  category: 'tools',
  description: { id: 'Unggah media yang dikirim atau dikutip jadi tautan publik uguu.se', en: 'Upload sent or quoted media into a public uguu.se link' },
  usage: '.upload',
  example: '.upload',
  cooldown: 10,
  limit: 2,
}

export const i18n = {
  id: {
    upload: {
      needMedia: '╭─❏ 🔗 「 *KIRIM MEDIANYA DULU* 」\n┊ Kirim media sambil menulis *.upload*, atau kutip medianya yaa~\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA unggah berkasnya ke uguu.se dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL UNGGAH* 」\n┊ Mouu, gagal unggah berkasnya: *{message}*\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *BERKAS KEGEDEAN* 」\n┊ Aduh, berkasnya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      done: '╭─❏ 🔗 「 *TAUTAN BERKAS* 」\n┊ {url}\n┊ ɴᴀᴍᴀ: *{fileName}*\n╰━━━━━━━',
    },
  },
  en: {
    upload: {
      needMedia: '╭─❏ 🔗 「 *SEND THE MEDIA FIRST* 」\n┊ Send media with *.upload* as the caption, or quote the media~\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is uploading the file to uguu.se... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *UPLOAD FAILED* 」\n┊ Mouu, failed to upload the file: *{message}*\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *FILE TOO BIG* 」\n┊ Oops, the file is too big (over *64 MB*)~\n╰━━━━━━━',
      done: '╭─❏ 🔗 「 *FILE LINK* 」\n┊ {url}\n┊ ɴᴀᴍᴇ: *{fileName}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.upload', expect: /medianya|media/i }

const EXT_BY_KIND = { image: 'jpg', video: 'mp4', sticker: 'webp', document: 'bin', audio: 'mp3' }

export async function handler(ctx) {
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('upload.failed', { message: err.message }))
  }
  if (!src?.buffer?.length) return ctx.reply(ctx.t('upload.needMedia'))
  if (src.buffer.length > MAX_DOCUMENT_BYTES) return ctx.reply(ctx.t('upload.tooBig'))
  await ctx.reply(ctx.t('upload.working', { mood: ctx.say('mikir') }))
  const nodeName = src.node?.fileName || ''
  const fileName = nodeName || `kana-upload.${EXT_BY_KIND[src.kind] || 'bin'}`
  let result
  try {
    result = await uploadToUguu(src.buffer, fileName)
  } catch (err) {
    return ctx.reply(ctx.t('upload.failed', { message: err.message }))
  }
  return ctx.reply(ctx.t('upload.done', { url: result.url, fileName: result.fileName || fileName }))
}
