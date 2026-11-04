import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument } from '../../src/ui/media.js'
import { extractPixeldrainId, pixeldrainFileUrl, pixeldrainInfo } from '../../src/scrapers/download/pixeldrain.js'

export const config = {
  name: 'pixeldrain',
  alias: ['pd'],
  category: 'download',
  description: { id: 'Unduh berkas publik dari Pixeldrain', en: 'Download a public file from Pixeldrain' },
  usage: '.pixeldrain <link pixeldrain>',
  example: '.pixeldrain https://pixeldrain.com/u/xxxxxxxx',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    pixeldrain: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK PIXELDRAIN* 」\n┊ ᴄᴏɴᴛᴏʜ: *.pixeldrain https://pixeldrain.com/u/xxxxxxxx*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambil berkasnya dari Pixeldrain dulu... {mood}\n╰━━━━━━━',
      caption: '╭─❏ 💾 「 *PIXELDRAIN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴜᴋᴜʀᴀɴ: *{size}*\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *BERKAS KEGEDEAN* 」\n┊ Berkasnya *{name}* kegedean buat dikirim lewat WA (*{size}*).\n┊ Unduh langsung di sini yaa: *{url}*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL BERKAS* 」\n┊ Mouu, gagal ambil dari Pixeldrain: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    pixeldrain: {
      needUrl: '╭─❏ 🔗 「 *SEND THE PIXELDRAIN LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.pixeldrain https://pixeldrain.com/u/xxxxxxxx*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the file from Pixeldrain... {mood}\n╰━━━━━━━',
      caption: '╭─❏ 💾 「 *PIXELDRAIN* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ꜱɪᴢᴇ: *{size}*\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *FILE TOO BIG* 」\n┊ The file *{name}* is too big to send over WA (*{size}*).\n┊ Download it directly here: *{url}*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH FILE* 」\n┊ Mouu, failed to fetch from Pixeldrain: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pixeldrain', expect: /pixeldrain/i }

const MAX_BYTES = 60 * 1024 * 1024

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export async function handler(ctx) {
  const id = extractPixeldrainId(ctx.text)
  if (!id) return ctx.reply(ctx.t('pixeldrain.needUrl'))
  await ctx.reply(ctx.t('pixeldrain.working', { mood: ctx.say('mikir') }))
  try {
    const info = await pixeldrainInfo(id)
    const url = pixeldrainFileUrl(id)
    if (info.size > MAX_BYTES) {
      return ctx.reply(ctx.t('pixeldrain.tooBig', { name: info.name, size: humanSize(info.size), url }))
    }
    const media = await downloadBuffer(url, { maxBytes: MAX_BYTES })
    return sendDocument(ctx, media.buffer, {
      fileName: info.name,
      caption: ctx.t('pixeldrain.caption', { name: info.name, size: humanSize(info.size) }),
    })
  } catch (err) {
    return ctx.reply(ctx.t('pixeldrain.failed', { message: err.message }))
  }
}
