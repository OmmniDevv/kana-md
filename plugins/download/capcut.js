import { capcutDownload, extractCapcutUrl } from '../../src/scrapers/download/capcut.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'capcut',
  alias: ['ccdl', 'capcutdl'],
  category: 'download',
  description: { id: 'Unduh video template CapCut tanpa watermark dari link template', en: 'Download a CapCut template video without watermark from a template link' },
  usage: '.capcut <link capcut>',
  example: '.capcut https://www.capcut.com/template-detail/7186615508471418114',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    capcut: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK CAPCUT* 」\n┊ ᴄᴏɴᴛᴏʜ: *.capcut https://www.capcut.com/template-detail/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin video template CapCut-nya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL VIDEO* 」\n┊ Mouu, gagal ambil videonya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO KEGEDEAN* 」\n┊ Aduh, videonya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *CAPCUT* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n╰━━━━━━━',
      btnRetry: 'Unduh ulang',
    },
  },
  en: {
    capcut: {
      needUrl: '╭─❏ 🔗 「 *SEND THE CAPCUT LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.capcut https://www.capcut.com/template-detail/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the CapCut template video... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH VIDEO* 」\n┊ Mouu, failed to fetch the video: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO TOO BIG* 」\n┊ Oops, the video is too big to send over WhatsApp (over *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *CAPCUT* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n╰━━━━━━━',
      btnRetry: 'Download again',
    },
  },
}

export const test = { input: '.capcut https://www.capcut.com/template-detail/7186615508471418114', expect: /capcut/i }

export async function handler(ctx) {
  const url = extractCapcutUrl(ctx.text)
  if (!url) return ctx.reply(ctx.t('capcut.needUrl'))
  await ctx.reply(ctx.t('capcut.working', { mood: ctx.say('mikir') }))
  try {
    const { title, videoUrl } = await capcutDownload(url)
    const media = await downloadBuffer(videoUrl, { maxBytes: MAX_VIDEO_BYTES })
    if (media.buffer.length > MAX_VIDEO_BYTES) return ctx.reply(ctx.t('capcut.tooBig'))
    const caption = ctx.t('capcut.caption', { title })
    await sendVideo(ctx, media.buffer, { caption })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: caption,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('capcut.btnRetry'), id: `.capcut ${url}` }],
      textFallback: caption,
    })
  } catch (err) {
    return ctx.reply(ctx.t('capcut.failed', { message: err.message }))
  }
}
