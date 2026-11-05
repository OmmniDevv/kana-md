// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/download/lirik.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'lirikyt',
  alias: [],
  category: 'search',
  description: { id: 'lirik lagu lengkap (sekarang alias di .lirik)', en: 'Now an alias of .lirik' },
  usage: '.lirik',
  example: '.lirik',
  cooldown: 5,
}

export const i18n = {
  id: {
    lirikyt: {
      unavailable: 'Perintah ini sudah digabung ke *.lirik* ya, pakai itu saja~',
    },
  },
  en: {
    lirikyt: {
      unavailable: 'This command has been merged into *.lirik*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('lirikyt.unavailable'))
}
