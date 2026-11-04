import { instagramDownload } from '../../src/scrapers/instagram/instagram.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, sendImage, MAX_VIDEO_BYTES, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ig',
  alias: ['igdl', 'instagram', 'instagramdl'],
  category: 'download',
  description: { id: 'Unduh foto atau video Instagram dari link', en: 'Download an Instagram photo or video from a link' },
  usage: '.ig <link instagram>',
  example: '.ig https://www.instagram.com/reel/xxxx/',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    ig: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK INSTAGRAM* 」\n┊ ᴄᴏɴᴛᴏʜ: *.ig https://www.instagram.com/reel/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin medianya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL MEDIA* 」\n┊ Mouu, gagal ambil medianya: *{message}*\n┊ Pastikan linknya dari akun publik ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *ADA MEDIA KEGEDEAN* 」\n┊ Aduh, ada media yang kegedean buat dikirim lewat WhatsApp, jadi KANA lewati ya~\n╰━━━━━━━',
      caption: '╭─❏ 📸 「 *INSTAGRAM* 」\n┊ *{title}*\n╰━━━━━━━',
      btnRetry: 'Unduh ulang',
      btnAio: 'Coba .aio',
      followUp: 'ʟᴀɴᴊᴜᴛᴀɴ: *.ig {url}*',
    },
  },
  en: {
    ig: {
      needUrl: '╭─❏ 🔗 「 *SEND THE INSTAGRAM LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.ig https://www.instagram.com/reel/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the media... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH MEDIA* 」\n┊ Mouu, failed to fetch the media: *{message}*\n┊ Make sure the link is from a public account~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *SOME MEDIA TOO BIG* 」\n┊ Oops, some media was too big to send over WhatsApp, so KANA skipped it~\n╰━━━━━━━',
      caption: '╭─❏ 📸 「 *INSTAGRAM* 」\n┊ *{title}*\n╰━━━━━━━',
      btnRetry: 'Download again',
      btnAio: 'Try .aio',
      followUp: 'ɴᴇxᴛ: *.ig {url}*',
    },
  },
}

// Tombol susulan sesudah media terkirim: unduh ulang URL yang sama.
// URL tidak tersedia: coba .aio saja.
export function buildIgButtons(url, t) {
  return url ? [{ text: t('ig.btnRetry'), id: `.ig ${url}` }] : [{ text: t('ig.btnAio'), id: '.aio' }]
}

export const test = { input: '.ig https://www.instagram.com/reel/DMXCETGSC5i/', expect: /Instagram|reel/i }

export async function handler(ctx) {
  const url = ctx.args[0]
  if (!url) return ctx.reply(ctx.t('ig.needUrl'))
  await ctx.reply(ctx.t('ig.working', { mood: ctx.say('mikir') }))
  const result = await instagramDownload(url)
  if (!result.status) return ctx.reply(ctx.t('ig.failed', { message: result.message }))
  const items = result.result.downloads.slice(0, 3)
  let skipped = false
  for (const [index, item] of items.entries()) {
    try {
      if (item.type === 'photo') {
        const media = await downloadBuffer(item.url, { maxBytes: MAX_IMAGE_BYTES })
        await sendImage(ctx, media.buffer, { caption: index === 0 ? ctx.t('ig.caption', { title: result.result.title }) : undefined })
      } else {
        const media = await downloadBuffer(item.url, { maxBytes: MAX_VIDEO_BYTES })
        await sendVideo(ctx, media.buffer, { caption: index === 0 ? ctx.t('ig.caption', { title: result.result.title }) : undefined })
      }
    } catch (err) {
      if (err.code === 'TOO_BIG') skipped = true
      else return ctx.reply(ctx.t('ig.failed', { message: err.message }))
    }
  }
  if (skipped) await ctx.reply(ctx.t('ig.tooBig'))
  const body = [ctx.t('ig.caption', { title: result.result.title }), ctx.t('ig.followUp', { url })].join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: buildIgButtons(url, ctx.t),
    textFallback: body,
  })
}
