// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/download/ytmp4.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'playvid',
  alias: [],
  category: 'search',
  description: { id: 'unduh video YouTube (sekarang alias di .ytmp4)', en: 'Now an alias of .ytmp4' },
  usage: '.ytmp4',
  example: '.ytmp4',
  cooldown: 5,
}

export const i18n = {
  id: {
    playvid: {
      unavailable: 'Perintah ini sudah digabung ke *.ytmp4* ya, pakai itu saja~',
    },
  },
  en: {
    playvid: {
      unavailable: 'This command has been merged into *.ytmp4*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('playvid.unavailable'))
}
