import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'squirrel',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara tupai: nada jauh lebih tinggi dari chipmunk', en: 'Squirrel effect: much higher pitch than chipmunk' },
  usage: '.squirrel (kutip audio/video)',
  example: '.squirrel',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    squirrel: {
      needAudio: '╭─❏ 🎧 「 *EFEK SQUIRREL* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.squirrel*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK SQUIRREL* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK SQUIRREL* 」\n┊ Nih, audionya udah jadi pakai efek *Squirrel*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK SQUIRREL* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK SQUIRREL* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    squirrel: {
      needAudio: '╭─❏ 🎧 「 *SQUIRREL EFFECT* 」\n┊ Quote an audio or video first, then type *.squirrel*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *SQUIRREL EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *SQUIRREL EFFECT* 」\n┊ Here, your audio now uses the *Squirrel* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *SQUIRREL EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *SQUIRREL EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.squirrel', expect: /kutip|quote/i }

export const handler = fxHandler('squirrel', { title: 'Squirrel' })
