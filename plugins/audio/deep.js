import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'deep',
  alias: ['deepvoice'],
  category: 'audio',
  description: { id: 'Suara deep: pitch rendah dari audio yang dikutip', en: 'Deep voice: low pitch from the quoted audio' },
  usage: '.deep (kutip audio/video)',
  example: '.deep',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    deep: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .deep~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    deep: {
      needAudio: 'Quote an audio or video first, then type .deep~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.deep', expect: /kutip|quote/i }

export const handler = fxHandler('deep', { title: 'Deep Voice' })
