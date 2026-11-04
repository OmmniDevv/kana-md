import { tiktokDownload } from '../../src/scrapers/tiktok/tiktok.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, sendImage, MAX_VIDEO_BYTES, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tiktok',
  alias: ['tt', 'ttdl', 'tiktokdl'],
  category: 'download',
  description: { id: 'Unduh video atau slide TikTok tanpa watermark', en: 'Download a TikTok video or slideshow without watermark' },
  usage: '.tiktok <link tiktok>',
  example: '.tiktok https://www.tiktok.com/@user/video/123456789',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    tiktok: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK TIKTOK* 」\n┊ ᴄᴏɴᴛᴏʜ: *.tiktok https://www.tiktok.com/@user/video/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin kontennya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL KONTEN* 」\n┊ Mouu, gagal ambil kontennya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO KEGEDEAN* 」\n┊ Aduh, videonya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *TIKTOK* 」\n┊ *{title}*\n╰━━━━━━━',
      btnRetry: 'Unduh ulang',
      btnAio: 'Coba .aio',
      followUp: 'ʟᴀɴᴊᴜᴛᴀɴ: *.tiktok {url}*',
    },
  },
  en: {
    tiktok: {
      needUrl: '╭─❏ 🔗 「 *SEND THE TIKTOK LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.tiktok https://www.tiktok.com/@user/video/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the content... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH CONTENT* 」\n┊ Mouu, failed to fetch the content: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO TOO BIG* 」\n┊ Oops, the video is too big to send over WhatsApp (over *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *TIKTOK* 」\n┊ *{title}*\n╰━━━━━━━',
      btnRetry: 'Download again',
      btnAio: 'Try .aio',
      followUp: 'ɴᴇxᴛ: *.tiktok {url}*',
    },
  },
}

// Tombol susulan sesudah media terkirim: unduh ulang URL yang sama.
// URL tidak tersedia: coba .aio saja.
export function buildTiktokButtons(url, t) {
  return url ? [{ text: t('tiktok.btnRetry'), id: `.tiktok ${url}` }] : [{ text: t('tiktok.btnAio'), id: '.aio' }]
}

export const test = { input: '.tiktok https://www.tiktok.com/@pojoksatu.id/video/7647074044960984340', expect: /video|TikTok/i }

export async function handler(ctx) {
  const url = ctx.args[0]
  if (!url) return ctx.reply(ctx.t('tiktok.needUrl'))
  await ctx.reply(ctx.t('tiktok.working', { mood: ctx.say('mikir') }))
  const result = await tiktokDownload(url)
  if (!result.status) return ctx.reply(ctx.t('tiktok.failed', { message: result.message }))
  const data = result.result
  const caption = ctx.t('tiktok.caption', { title: data.title || 'TikTok' })
  try {
    if (data.images?.length) {
      for (const [index, imageUrl] of data.images.slice(0, 4).entries()) {
        const media = await downloadBuffer(imageUrl, { maxBytes: MAX_IMAGE_BYTES })
        await sendImage(ctx, media.buffer, { caption: index === 0 ? caption : undefined })
      }
    } else {
      const media = await downloadBuffer(data.video, { maxBytes: MAX_VIDEO_BYTES })
      await sendVideo(ctx, media.buffer, { caption })
    }
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('tiktok.tooBig'))
    return ctx.reply(ctx.t('tiktok.failed', { message: err.message }))
  }
  const body = [caption, ctx.t('tiktok.followUp', { url })].join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: buildTiktokButtons(url, ctx.t),
    textFallback: body,
  })
}
