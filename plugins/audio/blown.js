import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'blown',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara blown/distorsi pecah ke audio yang dikutip', en: 'Blown/distorted effect on the quoted audio' },
  usage: '.blown (kutip audio/video)',
  example: '.blown',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    blown: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .blown~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    blown: {
      needAudio: 'Quote an audio or video first, then type .blown~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.blown', expect: /kutip|quote/i }

export const handler = fxHandler('blown', { title: 'Blown' })
