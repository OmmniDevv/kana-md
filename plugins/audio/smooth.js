import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'smooth',
  alias: [],
  category: 'audio',
  description: { id: 'Efek smooth: suara lebih halus dan lembut', en: 'Smooth effect: softer, silkier sound' },
  usage: '.smooth (kutip audio/video)',
  example: '.smooth',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    smooth: {
      needAudio: '╭─❏ 🎧 「 *EFEK SMOOTH* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.smooth*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK SMOOTH* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK SMOOTH* 」\n┊ Nih, audionya udah jadi pakai efek *Smooth*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK SMOOTH* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK SMOOTH* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    smooth: {
      needAudio: '╭─❏ 🎧 「 *SMOOTH EFFECT* 」\n┊ Quote an audio or video first, then type *.smooth*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *SMOOTH EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *SMOOTH EFFECT* 」\n┊ Here, your audio now uses the *Smooth* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *SMOOTH EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *SMOOTH EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.smooth', expect: /kutip|quote/i }

export const handler = fxHandler('smooth', { title: 'Smooth' })
