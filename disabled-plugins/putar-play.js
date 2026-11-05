// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/download/ytmp3.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'putar-play',
  alias: [],
  category: 'search',
  description: { id: 'putar dan unduh audio YouTube (sekarang alias di .ytmp3)', en: 'Now an alias of .ytmp3' },
  usage: '.ytmp3',
  example: '.ytmp3',
  cooldown: 5,
}

export const i18n = {
  id: {
    putar_play: {
      unavailable: 'Perintah ini sudah digabung ke *.ytmp3* ya, pakai itu saja~',
    },
  },
  en: {
    putar_play: {
      unavailable: 'This command has been merged into *.ytmp3*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('putar_play.unavailable'))
}
