export const config = {
  name: 'base64',
  alias: ['b64'],
  category: 'user',
  description: { id: 'Encode teks ke base64, atau decode dengan awalan decode', en: 'Encode text to base64, or decode with the decode prefix' },
  usage: '.base64 <teks> atau .base64 decode <kode>',
  example: '.base64 halo dunia',
  cooldown: 3,
}

export const i18n = {
  id: {
    base64: {
      ask: 'Tulis teksnya yaa: .base64 halo dunia, atau .base64 decode <kode> {mood}',
      encoded: '🔐 BASE64\n\n{result}',
      decoded: '🔓 HASIL DECODE BASE64\n\n{result}',
      invalid: 'Kode base64nya tidak valid, coba periksa lagi yaa~ {mood}',
    },
  },
  en: {
    base64: {
      ask: 'Write the text: .base64 hello world, or .base64 decode <code> {mood}',
      encoded: '🔐 BASE64\n\n{result}',
      decoded: '🔓 BASE64 DECODE RESULT\n\n{result}',
      invalid: 'That base64 code is not valid, please check it again~ {mood}',
    },
  },
}

export const test = { input: '.base64 halo', expect: /base64/i }

export async function handler(ctx) {
  const input = (ctx.text || '').trim()
  if (!input) return ctx.reply(ctx.t('base64.ask', { mood: ctx.say('mikir') }))
  const decMatch = input.match(/^decode\s+(.+)$/is)
  if (decMatch) {
    const code = decMatch[1].replace(/\s+/g, '')
    if (!/^[A-Za-z0-9+/=_-]+$/.test(code)) return ctx.reply(ctx.t('base64.invalid', { mood: ctx.say('gagal') }))
    try {
      const result = Buffer.from(code, 'base64').toString('utf8')
      return ctx.reply(ctx.t('base64.decoded', { result: result.slice(0, 1500) }))
    } catch {
      return ctx.reply(ctx.t('base64.invalid', { mood: ctx.say('gagal') }))
    }
  }
  return ctx.reply(ctx.t('base64.encoded', { result: Buffer.from(input, 'utf8').toString('base64') }))
}
