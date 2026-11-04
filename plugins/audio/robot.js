import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'robot',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara robot metalik ke audio yang dikutip', en: 'Metallic robot voice effect on the quoted audio' },
  usage: '.robot (kutip audio/video)',
  example: '.robot',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    robot: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .robot~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    robot: {
      needAudio: 'Quote an audio or video first, then type .robot~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.robot', expect: /kutip|quote/i }

export const handler = fxHandler('robot', { title: 'Robot' })
