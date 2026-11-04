import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'fast',
  alias: [],
  category: 'audio',
  description: { id: 'Efek fast: cepatkan audio yang dikutip', en: 'Fast effect: speed up the quoted audio' },
  usage: '.fast (kutip audio/video)',
  example: '.fast',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    fast: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .fast~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    fast: {
      needAudio: 'Quote an audio or video first, then type .fast~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.fast', expect: /kutip|quote/i }

export const handler = fxHandler('fast', { title: 'Fast' })
