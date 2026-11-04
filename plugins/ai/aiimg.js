import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'aiimg',
  alias: ['aiimage', 'buatgambar', 'text2img', 't2i', 'imggen', 'imagegen', 'txt2img', 'animeimg', 'fantasyimg', 'realimg', 'pixelimg'],
  category: 'ai',
  description: { id: 'Buat gambar dari teks memakai AI (Pollinations)', en: 'Generate an image from text with AI (Pollinations)' },
  usage: '.aiimg <deskripsi gambar>',
  example: '.aiimg kucing astronot lucu di bulan',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    aiimg: {
      needPrompt: '╭─❏ 🎨 「 *TULIS DESKRIPSINYA DULU* 」\n┊ Tulis deskripsi gambarnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.aiimg kucing astronot lucu di bulan* 🎨\n╰━━━━━━━',
      generating: '╭─❏ 🎨 「 *LAGI DIGAMBAR* 」\n┊ Siap, KANA gambar dulu yaa... tunggu bentar~ {mood} ✨\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAMBAR GAGAL DIBUAT* 」\n┊ Mouu, gambarnya gagal dibuat: *{message}*\n┊ Layanan gambar gratisnya lagi bermasalah, coba lagi nanti ya~ (╥﹏╥)\n╰━━━━━━━',
      tooBig: '╭─❏ 💦 「 *GAMBAR KEGADEAN* 」\n┊ Aduh, gambarnya kegedean buat dikirim lewat WhatsApp nih.\n┊ Coba deskripsi lain ya~\n╰━━━━━━━',
      caption: '╭─❏ 🎨 「 *GAMBAR AI JADI* 」\n┊ ᴘʀᴏᴍᴘᴛ: *"{prompt}"*~\n┊ Gimana, lucu kan? (≧▽≦) ✨\n╰━━━━━━━',
      btnAgain: 'Buat Lagi',
    },
  },
  en: {
    aiimg: {
      needPrompt: '╭─❏ 🎨 「 *WRITE THE DESCRIPTION FIRST* 」\n┊ Write the image description first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.aiimg cute astronaut cat on the moon* 🎨\n╰━━━━━━━',
      generating: '╭─❏ 🎨 「 *DRAWING IT NOW* 」\n┊ Got it, KANA is drawing it now... wait a bit~ {mood} ✨\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *IMAGE FAILED* 」\n┊ Mouu, the image failed to generate: *{message}*\n┊ The free image service is having trouble, try again later~ (╥﹏╥)\n╰━━━━━━━',
      tooBig: '╭─❏ 💦 「 *IMAGE TOO BIG* 」\n┊ Oops, the image is too big to send over WhatsApp.\n┊ Try another description~\n╰━━━━━━━',
      caption: '╭─❏ 🎨 「 *AI IMAGE READY* 」\n┊ ᴘʀᴏᴍᴘᴛ: *"{prompt}"*~\n┊ Cute, right? (≧▽≦) ✨\n╰━━━━━━━',
      btnAgain: 'Make Again',
    },
  },
}

export const test = { input: '.aiimg kucing oren lucu memakai kacamata', expect: /kucing oren/i }

export async function handler(ctx) {
  const prompt = ctx.text.trim()
  if (!prompt) return ctx.reply(ctx.t('aiimg.needPrompt'))
  await ctx.reply(ctx.t('aiimg.generating', { mood: ctx.say('mikir') }))
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`
  let media
  try {
    media = await withBreaker('pollinations-image', () =>
      downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 60000 })
    )
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('aiimg.tooBig'))
    return ctx.reply(ctx.t('aiimg.failed', { message: err.message }))
  }
  const caption = ctx.t('aiimg.caption', { prompt: prompt.slice(0, 120) })
  await sendImage(ctx, media.buffer, { caption })
  const shortPrompt = prompt.slice(0, 80)
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body: caption,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('aiimg.btnAgain'), id: `.aiimg ${shortPrompt}` }],
    textFallback: caption,
  })
}
