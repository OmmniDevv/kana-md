import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'fast',
  alias: [],
  category: 'audio',
  description: { id: 'Efek fast: cepatkan audio yang dikutip', en: 'Fast effect: speed up the quoted audio' },
  usage: '.fast (kutip audio/video)',
  example: '.fast',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    fast: {
      needAudio: '╭─❏ 🎧 「 *EFEK FAST* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.fast*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK FAST* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK FAST* 」\n┊ Nih, audionya udah jadi pakai efek *Fast*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK FAST* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK FAST* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    fast: {
      needAudio: '╭─❏ 🎧 「 *FAST EFFECT* 」\n┊ Quote an audio or video first, then type *.fast*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *FAST EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *FAST EFFECT* 」\n┊ Here, your audio now uses the *Fast* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *FAST EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *FAST EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.fast', expect: /kutip|quote/i }

export const handler = fxHandler('fast', { title: 'Fast' })
