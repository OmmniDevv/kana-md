import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'nightcore',
  alias: [],
  category: 'audio',
  description: { id: 'Versi nightcore: pitch dan tempo naik 25 persen', en: 'Nightcore version: pitch and tempo up 25 percent' },
  usage: '.nightcore (kutip audio/video)',
  example: '.nightcore',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    nightcore: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .nightcore~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    nightcore: {
      needAudio: 'Quote an audio or video first, then type .nightcore~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.nightcore', expect: /kutip|quote/i }

export const handler = fxHandler('nightcore', { title: 'Nightcore' })
