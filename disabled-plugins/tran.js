// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/terjemah.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'tran',
  alias: [],
  category: 'tools',
  description: { id: 'terjemahan teks (sekarang alias di .terjemah)', en: 'Now an alias of .terjemah' },
  usage: '.terjemah',
  example: '.terjemah',
  cooldown: 5,
}

export const i18n = {
  id: {
    tran: {
      unavailable: 'Perintah ini sudah digabung ke *.terjemah* ya, pakai itu saja~',
    },
  },
  en: {
    tran: {
      unavailable: 'This command has been merged into *.terjemah*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('tran.unavailable'))
}
