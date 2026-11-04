import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'logoglow',
  alias: [],
  category: 'maker',
  description: { id: 'Logo teks bercahaya neon ungu dari teks kamu', en: 'Glowing purple neon text logo from your text' },
  usage: '.logoglow <teks>',
  example: '.logoglow OMNIDEVV',
  cooldown: 5,
}

export const i18n = {
  id: { logoglow: { hint: 'Tulis teks logonya yaa~ Contoh: .logoglow OMNIDEVV', caption: 'Logo glow *{text}* jadii~ {mood}', fail: 'Gagal bikin logo: {error}' } },
  en: { logoglow: { hint: 'Write the logo text please~ Example: .logoglow OMNIDEVV', caption: 'Glow logo *{text}* is ready~ {mood}', fail: 'Failed to make the logo: {error}' } },
}

export const test = { input: '.logoglow', expect: /logo/i }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 30)
  if (!text) return ctx.reply(ctx.t('logoglow.hint'))
  try {
    const buffer = await textImage({
      width: 1024, height: 512, background: '0x150826',
      lines: [
        { text, size: 84, color: 'e879f9', bold: true, y: 190 },
        { text: '✦ GLOW EDITION ✦', size: 30, color: 'a78bfa', y: 320 },
      ],
    })
    return sendImage(ctx, buffer, { caption: ctx.t('logoglow.caption', { text, mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('logoglow.fail', { error: err.message }))
  }
}
