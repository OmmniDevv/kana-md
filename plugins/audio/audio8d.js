import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'audio8d',
  alias: ["8d"],
  category: 'audio',
  description: { id: 'Efek audio 8D berputar dari audio yang dikutip', en: 'Rotating 8D audio effect from the quoted audio' },
  usage: '.audio8d (kutip audio/video)',
  example: '.audio8d',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    audio8d: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .audio8d~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    audio8d: {
      needAudio: 'Quote an audio or video first, then type .audio8d~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.audio8d', expect: /kutip|quote/i }

export const handler = fxHandler('audio8d', { title: 'Audio 8D' })
