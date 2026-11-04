import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'smooth',
  alias: [],
  category: 'audio',
  description: { id: 'Efek smooth: suara lebih halus dan lembut', en: 'Smooth effect: softer, silkier sound' },
  usage: '.smooth (kutip audio/video)',
  example: '.smooth',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    smooth: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .smooth~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    smooth: {
      needAudio: 'Quote an audio or video first, then type .smooth~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.smooth', expect: /kutip|quote/i }

export const handler = fxHandler('smooth', { title: 'Smooth' })
