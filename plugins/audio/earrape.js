import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'earrape',
  alias: [],
  category: 'audio',
  description: { id: 'Efek earrape: volume dan bass dinaikkan ekstrem (hati-hati kuping)', en: 'Earrape effect: extreme volume and bass boost (mind your ears)' },
  usage: '.earrape (kutip audio/video)',
  example: '.earrape',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    earrape: {
      needAudio: '╭─❏ 🎧 「 *EFEK EARRAPE* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.earrape*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK EARRAPE* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK EARRAPE* 」\n┊ Nih, audionya udah jadi pakai efek *Earrape*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK EARRAPE* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK EARRAPE* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    earrape: {
      needAudio: '╭─❏ 🎧 「 *EARRAPE EFFECT* 」\n┊ Quote an audio or video first, then type *.earrape*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EARRAPE EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EARRAPE EFFECT* 」\n┊ Here, your audio now uses the *Earrape* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EARRAPE EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EARRAPE EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.earrape', expect: /kutip|quote/i }

export const handler = fxHandler('earrape', { title: 'Earrape' })
