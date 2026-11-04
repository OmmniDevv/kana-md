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
      needAudio: '╭─❏ 🎧 「 *EFEK REVERSE* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.reverse*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK REVERSE* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK REVERSE* 」\n┊ Nih, audionya udah jadi pakai efek *Reverse*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK REVERSE* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK REVERSE* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    reverse: {
      needAudio: '╭─❏ 🎧 「 *REVERSE EFFECT* 」\n┊ Quote an audio or video first, then type *.reverse*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *REVERSE EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *REVERSE EFFECT* 」\n┊ Here, your audio now uses the *Reverse* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *REVERSE EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *REVERSE EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.reverse', expect: /kutip|quote/i }

export const handler = fxHandler('reverse', { title: 'Reverse' })
