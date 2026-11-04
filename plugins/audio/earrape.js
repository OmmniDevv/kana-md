import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'earrape',
  alias: [],
  category: 'audio',
  description: { id: 'Efek earrape: volume dan bass dinaikkan ekstrem (hati-hati kuping)', en: 'Earrape effect: extreme volume and bass boost (mind your ears)' },
  usage: '.earrape (kutip audio/video)',
  example: '.earrape',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    earrape: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .earrape~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    earrape: {
      needAudio: 'Quote an audio or video first, then type .earrape~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.earrape', expect: /kutip|quote/i }

export const handler = fxHandler('earrape', { title: 'Earrape' })
