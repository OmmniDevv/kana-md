import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'blown',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara blown/distorsi pecah ke audio yang dikutip', en: 'Blown/distorted effect on the quoted audio' },
  usage: '.blown (kutip audio/video)',
  example: '.blown',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    blown: {
      needAudio: '╭─❏ 🎧 「 *EFEK BLOWN* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.blown*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK BLOWN* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK BLOWN* 」\n┊ Nih, audionya udah jadi pakai efek *Blown*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK BLOWN* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK BLOWN* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    blown: {
      needAudio: '╭─❏ 🎧 「 *BLOWN EFFECT* 」\n┊ Quote an audio or video first, then type *.blown*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *BLOWN EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *BLOWN EFFECT* 」\n┊ Here, your audio now uses the *Blown* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *BLOWN EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *BLOWN EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.blown', expect: /kutip|quote/i }

export const handler = fxHandler('blown', { title: 'Blown' })
