import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'chipmunk',
  alias: ["tupai"],
  category: 'audio',
  description: { id: 'Suara chipmunk: pitch tinggi dari audio yang dikutip', en: 'Chipmunk voice: high pitch from the quoted audio' },
  usage: '.chipmunk (kutip audio/video)',
  example: '.chipmunk',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    chipmunk: {
      needAudio: '╭─❏ 🎧 「 *EFEK CHIPMUNK* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.chipmunk*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK CHIPMUNK* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK CHIPMUNK* 」\n┊ Nih, audionya udah jadi pakai efek *Chipmunk*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK CHIPMUNK* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK CHIPMUNK* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    chipmunk: {
      needAudio: '╭─❏ 🎧 「 *CHIPMUNK EFFECT* 」\n┊ Quote an audio or video first, then type *.chipmunk*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *CHIPMUNK EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *CHIPMUNK EFFECT* 」\n┊ Here, your audio now uses the *Chipmunk* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *CHIPMUNK EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *CHIPMUNK EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.chipmunk', expect: /kutip|quote/i }

export const handler = fxHandler('chipmunk', { title: 'Chipmunk' })
