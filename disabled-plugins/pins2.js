// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/pin.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'pins2',
  alias: [],
  category: 'search',
  description: { id: 'album gambar Pinterest (sekarang alias di .pin)', en: 'Now an alias of .pin' },
  usage: '.pin',
  example: '.pin',
  cooldown: 5,
}

export const i18n = {
  id: {
    pins2: {
      unavailable: 'Perintah ini sudah digabung ke *.pin* ya, pakai itu saja~',
    },
  },
  en: {
    pins2: {
      unavailable: 'This command has been merged into *.pin*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('pins2.unavailable'))
}
