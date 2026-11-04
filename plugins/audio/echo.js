import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'echo',
  alias: ["gema"],
  category: 'audio',
  description: { id: 'Tambah efek gema ke audio yang dikutip', en: 'Add an echo effect to the quoted audio' },
  usage: '.echo (kutip audio/video)',
  example: '.echo',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    echo: {
      needAudio: 'Kutip audio atau videonya dulu yaa, terus ketik .echo~',
      tooBig: 'Mouu, medianya kegedean (di atas 64 MB)~',
      failed: 'Mouu, gagal menerapkan efek: {message}~',
    },
  },
  en: {
    echo: {
      needAudio: 'Quote an audio or video first, then type .echo~',
      tooBig: 'Mouu, the media is too big (over 64 MB)~',
      failed: 'Mouu, failed to apply the effect: {message}~',
    },
  },
}

export const test = { input: '.echo', expect: /kutip|quote/i }

export const handler = fxHandler('echo', { title: 'Echo' })
