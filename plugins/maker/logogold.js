import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'logogold',
  alias: [],
  category: 'maker',
  description: { id: 'Logo teks emas mewah dari teks kamu', en: 'Luxury gold text logo from your text' },
  usage: '.logogold <teks>',
  example: '.logogold OMNIDEVV',
  cooldown: 5,
}

export const i18n = {
  id: { logogold: { hint: 'Tulis teks logonya yaa~ Contoh: .logogold OMNIDEVV', caption: 'Logo emas *{text}* jadii~ {mood}', fail: 'Gagal bikin logo: {error}' } },
  en: { logogold: { hint: 'Write the logo text please~ Example: .logogold OMNIDEVV', caption: 'Gold logo *{text}* is ready~ {mood}', fail: 'Failed to make the logo: {error}' } },
}

export const test = { input: '.logogold', expect: /logo/i }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 30)
  if (!text) return ctx.reply(ctx.t('logogold.hint'))
  try {
    const buffer = await textImage({
      width: 1024, height: 512, background: '0x1a1207',
      lines: [
        { text, size: 84, color: 'ffd700', bold: true, y: 190 },
        { text: '— LUXURY GOLD —', size: 30, color: 'd4af37', y: 320 },
      ],
    })
    return sendImage(ctx, buffer, { caption: ctx.t('logogold.caption', { text, mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('logogold.fail', { error: err.message }))
  }
}
