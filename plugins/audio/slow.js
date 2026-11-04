import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'slow',
  alias: [],
  category: 'audio',
  description: { id: 'Efek slow: perlambat audio yang dikutip', en: 'Slow effect: slow down the quoted audio' },
  usage: '.slow (kutip audio/video)',
  example: '.slow',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    slow: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .slow~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    slow: {
      needAudio: 'Quote an audio or video first, then type .slow~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.slow', expect: /kutip|quote/i }

export const handler = fxHandler('slow', { title: 'Slow' })
