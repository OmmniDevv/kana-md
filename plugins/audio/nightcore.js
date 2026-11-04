import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'nightcore',
  alias: [],
  category: 'audio',
  description: { id: 'Versi nightcore: pitch dan tempo naik 25 persen', en: 'Nightcore version: pitch and tempo up 25 percent' },
  usage: '.nightcore (kutip audio/video)',
  example: '.nightcore',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    nightcore: {
      needAudio: '╭─❏ 🎧 「 *EFEK NIGHTCORE* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.nightcore*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK NIGHTCORE* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK NIGHTCORE* 」\n┊ Nih, audionya udah jadi pakai efek *Nightcore*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK NIGHTCORE* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK NIGHTCORE* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    nightcore: {
      needAudio: '╭─❏ 🎧 「 *NIGHTCORE EFFECT* 」\n┊ Quote an audio or video first, then type *.nightcore*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *NIGHTCORE EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *NIGHTCORE EFFECT* 」\n┊ Here, your audio now uses the *Nightcore* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *NIGHTCORE EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *NIGHTCORE EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.nightcore', expect: /kutip|quote/i }

export const handler = fxHandler('nightcore', { title: 'Nightcore' })
