import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'slow',
  alias: [],
  category: 'audio',
  description: { id: 'Efek slow: perlambat audio yang dikutip', en: 'Slow effect: slow down the quoted audio' },
  usage: '.slow (kutip audio/video)',
  example: '.slow',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    slow: {
      needAudio: '╭─❏ 🎧 「 *EFEK SLOW* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.slow*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK SLOW* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK SLOW* 」\n┊ Nih, audionya udah jadi pakai efek *Slow*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK SLOW* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK SLOW* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    slow: {
      needAudio: '╭─❏ 🎧 「 *SLOW EFFECT* 」\n┊ Quote an audio or video first, then type *.slow*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *SLOW EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *SLOW EFFECT* 」\n┊ Here, your audio now uses the *Slow* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *SLOW EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *SLOW EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.slow', expect: /kutip|quote/i }

export const handler = fxHandler('slow', { title: 'Slow' })
