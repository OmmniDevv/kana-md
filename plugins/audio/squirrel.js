import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'squirrel',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara tupai: nada jauh lebih tinggi dari chipmunk', en: 'Squirrel effect: much higher pitch than chipmunk' },
  usage: '.squirrel (kutip audio/video)',
  example: '.squirrel',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    squirrel: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .squirrel~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    squirrel: {
      needAudio: 'Quote an audio or video first, then type .squirrel~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.squirrel', expect: /kutip|quote/i }

export const handler = fxHandler('squirrel', { title: 'Squirrel' })
