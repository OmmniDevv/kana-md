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
      needAudio: '╭─❏ 🎧 「 *EFEK AUDIO 8D* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.audio8d*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK AUDIO 8D* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK AUDIO 8D* 」\n┊ Nih, audionya udah jadi pakai efek *Audio 8D*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK AUDIO 8D* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK AUDIO 8D* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    audio8d: {
      needAudio: '╭─❏ 🎧 「 *AUDIO 8D EFFECT* 」\n┊ Quote an audio or video first, then type *.audio8d*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *AUDIO 8D EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *AUDIO 8D EFFECT* 」\n┊ Here, your audio now uses the *Audio 8D* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *AUDIO 8D EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *AUDIO 8D EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.audio8d', expect: /kutip|quote/i }

export const handler = fxHandler('audio8d', { title: 'Audio 8D' })
