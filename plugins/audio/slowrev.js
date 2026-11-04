import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'slowrev',
  alias: ["slowed"],
  category: 'audio',
  description: { id: 'Versi slowed plus reverb dari audio yang dikutip', en: 'Slowed plus reverb version of the quoted audio' },
  usage: '.slowrev (kutip audio/video)',
  example: '.slowrev',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    slowrev: {
      needAudio: '╭─❏ 🎧 「 *EFEK SLOWED REVERB* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.slowrev*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK SLOWED REVERB* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK SLOWED REVERB* 」\n┊ Nih, audionya udah jadi pakai efek *Slowed Reverb*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK SLOWED REVERB* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK SLOWED REVERB* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    slowrev: {
      needAudio: '╭─❏ 🎧 「 *SLOWED REVERB EFFECT* 」\n┊ Quote an audio or video first, then type *.slowrev*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *SLOWED REVERB EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *SLOWED REVERB EFFECT* 」\n┊ Here, your audio now uses the *Slowed Reverb* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *SLOWED REVERB EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *SLOWED REVERB EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.slowrev', expect: /kutip|quote/i }

export const handler = fxHandler('slowrev', { title: 'Slowed Reverb' })
