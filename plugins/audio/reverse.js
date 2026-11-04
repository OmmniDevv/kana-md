import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'reverse',
  alias: ["baliksuara"],
  category: 'audio',
  description: { id: 'Putar balik audio yang dikutip', en: 'Play the quoted audio in reverse' },
  usage: '.reverse (kutip audio/video)',
  example: '.reverse',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    reverse: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .reverse~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    reverse: {
      needAudio: 'Quote an audio or video first, then type .reverse~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.reverse', expect: /kutip|quote/i }

export const handler = fxHandler('reverse', { title: 'Reverse' })
