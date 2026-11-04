import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'fat',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara fat: lebih lambat, berat, dan ngebass', en: 'Fat effect: slower, heavier, bassy sound' },
  usage: '.fat (kutip audio/video)',
  example: '.fat',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    fat: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .fat~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    fat: {
      needAudio: 'Quote an audio or video first, then type .fat~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.fat', expect: /kutip|quote/i }

export const handler = fxHandler('fat', { title: 'Fat' })
