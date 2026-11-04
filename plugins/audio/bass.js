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
      needAudio: '╭─❏ 🎧 「 *EFEK BASS BOOST* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.bass*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK BASS BOOST* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK BASS BOOST* 」\n┊ Nih, audionya udah jadi pakai efek *Bass Boost*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK BASS BOOST* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK BASS BOOST* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    bass: {
      needAudio: '╭─❏ 🎧 「 *BASS BOOST EFFECT* 」\n┊ Quote an audio or video first, then type *.bass*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *BASS BOOST EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *BASS BOOST EFFECT* 」\n┊ Here, your audio now uses the *Bass Boost* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *BASS BOOST EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *BASS BOOST EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.bass', expect: /kutip|quote/i }

export const handler = fxHandler('bass', { title: 'Bass Boost' })
