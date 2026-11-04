import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'aiimg',
  alias: ['aiimage', 'buatgambar'],
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
      needPrompt: 'Tulis deskripsi gambarnya dulu yaa, contoh: .aiimg kucing astronot lucu di bulan~ 🎨',
      generating: 'Siap, KANA gambar dulu yaa... tunggu bentar~ {mood} 🎨✨',
      failed: 'Mouu, gambarnya gagal dibuat: {message}. Layanan gambar gratisnya lagi bermasalah, coba lagi nanti ya~ (╥﹏╥)',
      tooBig: 'Aduh, gambarnya kegedean buat dikirim lewat WhatsApp nih. Coba deskripsi lain ya~',
      caption: 'Nih gambar buat "{prompt}"~ Gimana, lucu kan? (≧▽≦) 🎨✨',
      btnAgain: 'Buat Lagi',
      btnMenu: 'Menu AI',
    },
  },
  en: {
    aiimg: {
      needPrompt: 'Write the image description first, example: .aiimg cute astronaut cat on the moon~ 🎨',
      generating: 'Got it, KANA is drawing it now... wait a bit~ {mood} 🎨✨',
      failed: 'Mouu, the image failed to generate: {message}. The free image service is having trouble, try again later~ (╥﹏╥)',
      tooBig: 'Oops, the image is too big to send over WhatsApp. Try another description~',
      caption: 'Here is the image for "{prompt}"~ Cute, right? (≧▽≦) 🎨✨',
      btnAgain: 'Make Again',
      btnMenu: 'AI Menu',
    },
  },
}

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
    replies: [
      { text: ctx.t('aiimg.btnAgain'), id: `.aiimg ${shortPrompt}` },
      { text: ctx.t('aiimg.btnMenu'), id: '.menu ai' },
    ],
    textFallback: caption,
  })
}
