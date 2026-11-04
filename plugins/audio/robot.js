import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'robot',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara robot metalik ke audio yang dikutip', en: 'Metallic robot voice effect on the quoted audio' },
  usage: '.robot (kutip audio/video)',
  example: '.robot',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    robot: {
      needAudio: '╭─❏ 🎧 「 *EFEK ROBOT* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.robot*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK ROBOT* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK ROBOT* 」\n┊ Nih, audionya udah jadi pakai efek *Robot*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK ROBOT* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK ROBOT* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    robot: {
      needAudio: '╭─❏ 🎧 「 *ROBOT EFFECT* 」\n┊ Quote an audio or video first, then type *.robot*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *ROBOT EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *ROBOT EFFECT* 」\n┊ Here, your audio now uses the *Robot* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *ROBOT EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *ROBOT EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.robot', expect: /kutip|quote/i }

export const handler = fxHandler('robot', { title: 'Robot' })
