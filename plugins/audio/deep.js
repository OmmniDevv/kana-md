import { fxHandler } from '../../src/audio/fx.js'

export const config = {
  name: 'deep',
  alias: ['deepvoice'],
  category: 'audio',
  description: { id: 'Suara deep: pitch rendah dari audio yang dikutip', en: 'Deep voice: low pitch from the quoted audio' },
  usage: '.deep (kutip audio/video)',
  example: '.deep',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    deep: {
      needAudio: '╭─❏ 🎧 「 *EFEK DEEP VOICE* 」\n┊ Kutip audio atau videonya dulu yaa, terus ketik *.deep*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *EFEK DEEP VOICE* 」\n┊ Tunggu sebentar yaa, efeknya lagi KANA proses~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *EFEK DEEP VOICE* 」\n┊ Nih, audionya udah jadi pakai efek *Deep Voice*~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *EFEK DEEP VOICE* 」\n┊ Mouu, medianya kegedean (di atas *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *EFEK DEEP VOICE* 」\n┊ Mouu, gagal menerapkan efek: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    deep: {
      needAudio: '╭─❏ 🎧 「 *DEEP VOICE EFFECT* 」\n┊ Quote an audio or video first, then type *.deep*~\n╰━━━━━━━',
      processing: '╭─❏ 🎧 「 *DEEP VOICE EFFECT* 」\n┊ Wait a moment, KANA is applying the effect~\n╰━━━━━━━',
      done: '╭─❏ 🎧 「 *DEEP VOICE EFFECT* 」\n┊ Here, your audio now uses the *Deep Voice* effect~\n╰━━━━━━━',
      tooBig: '╭─❏ 🎧 「 *DEEP VOICE EFFECT* 」\n┊ Mouu, the media is too big (over *64 MB*)~\n╰━━━━━━━',
      failed: '╭─❏ 🎧 「 *DEEP VOICE EFFECT* 」\n┊ Mouu, failed to apply the effect: *{message}*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.deep', expect: /kutip|quote/i }

export const handler = fxHandler('deep', { title: 'Deep Voice' })
