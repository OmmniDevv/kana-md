import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'chipmunk',
  alias: ["tupai"],
  category: 'audio',
  description: { id: 'Suara chipmunk: pitch tinggi dari audio yang dikutip', en: 'Chipmunk voice: high pitch from the quoted audio' },
  usage: '.chipmunk (kutip audio/video)',
  example: '.chipmunk',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    chipmunk: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .chipmunk~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    chipmunk: {
      needAudio: 'Quote an audio or video first, then type .chipmunk~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.chipmunk', expect: /kutip|quote/i }

export const handler = fxHandler('chipmunk', { title: 'Chipmunk' })
