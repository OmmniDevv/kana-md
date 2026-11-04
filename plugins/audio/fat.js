import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'fat',
  alias: [],
  category: 'audio',
  description: { id: 'Efek suara fat: lebih lambat, berat, dan ngebass', en: 'Fat effect: slower, heavier, bassy sound' },
  usage: '.fat (kutip audio/video)',
  example: '.fat',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    fat: {
      needAudio: '╭─❏ 🎧 「 *EFEK FAT* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.fat*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK FAT* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK FAT* 」\n┊ Nih, audionya udah jadi pakai efek *Fat*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK FAT* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK FAT* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    fat: {
      needAudio: '╭─❏ 🎧 「 *FAT EFFECT* 」\n┊ Quote an audio or video first, then type *.fat*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *FAT EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *FAT EFFECT* 」\n┊ Here, your audio now uses the *Fat* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *FAT EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *FAT EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.fat', expect: /kutip|quote/i }

export const handler = fxHandler('fat', { title: 'Fat' })
