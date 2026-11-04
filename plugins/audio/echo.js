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
      needAudio: '╭─❏ 🎧 「 *EFEK ECHO* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.echo*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK ECHO* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK ECHO* 」\n┊ Nih, audionya udah jadi pakai efek *Echo*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK ECHO* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK ECHO* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    echo: {
      needAudio: '╭─❏ 🎧 「 *ECHO EFFECT* 」\n┊ Quote an audio or video first, then type *.echo*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *ECHO EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *ECHO EFFECT* 」\n┊ Here, your audio now uses the *Echo* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *ECHO EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *ECHO EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.echo', expect: /kutip|quote/i }

export const handler = fxHandler('echo', { title: 'Echo' })
