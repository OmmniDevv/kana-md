import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'slowrev',
  alias: ["slowed"],
  category: 'audio',
  description: { id: 'Versi slowed plus reverb dari audio yang dikutip', en: 'Slowed plus reverb version of the quoted audio' },
  usage: '.slowrev (kutip audio/video)',
  example: '.slowrev',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    slowrev: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .slowrev~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    slowrev: {
      needAudio: 'Quote an audio or video first, then type .slowrev~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.slowrev', expect: /kutip|quote/i }

export const handler = fxHandler('slowrev', { title: 'Slowed Reverb' })
