import { resolveMediafire } from '../../src/scrapers/download/mediafire.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument, MAX_DOCUMENT_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'mediafire',
  limitGroup: 'download',
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
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK MEDIAFIRE* 」\n┊ ᴄᴏɴᴛᴏʜ: *.mediafire https://www.mediafire.com/file/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin filenya dari MediaFire dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL FILE* 」\n┊ Mouu, gagal ambil filenya: *{message}*\n┊ Pastikan linknya benar dan filenya masih ada ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *FILE KEGEDEAN* 」\n┊ Aduh, filenya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 📥 「 *MEDIAFIRE* 」\n┊ ɴᴀᴍᴀ ꜰɪʟᴇ: *{fileName}*\n╰━━━━━━━',
    },
  },
  en: {
    mediafire: {
      needUrl: '╭─❏ 🔗 「 *SEND THE MEDIAFIRE LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.mediafire https://www.mediafire.com/file/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the file from MediaFire... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH FILE* 」\n┊ Mouu, failed to fetch the file: *{message}*\n┊ Make sure the link is correct and the file still exists~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *FILE TOO BIG* 」\n┊ Oops, the file is too big to send over WhatsApp (over *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 📥 「 *MEDIAFIRE* 」\n┊ ꜰɪʟᴇ ɴᴀᴍᴇ: *{fileName}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.mediafire http://www.mediafire.com/file/rqhuey1ouz6z4aq/VervalNoPonsel_04092020_publik.pdf/file', expect: /VervalNoPonsel/i }

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
