import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'bass',
  alias: [],
  category: 'audio',
  description: { id: 'Tambah bass tebal ke audio yang dikutip', en: 'Add thick bass to the quoted audio' },
  usage: '.bass (kutip audio/video)',
  example: '.bass',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    bass: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .bass~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    bass: {
      needAudio: 'Quote an audio or video first, then type .bass~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.bass', expect: /kutip|quote/i }

export const handler = fxHandler('bass', { title: 'Bass Boost' })
