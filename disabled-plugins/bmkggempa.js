// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/gempa.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'bmkggempa',
  alias: [],
  category: 'info',
  description: { id: 'gempa terbaru BMKG (sekarang alias di .gempa)', en: 'Now an alias of .gempa' },
  usage: '.gempa',
  example: '.gempa',
  cooldown: 5,
}

export const i18n = {
  id: {
    bmkggempa: {
      unavailable: 'Perintah ini sudah digabung ke *.gempa* ya, pakai itu saja~',
    },
  },
  en: {
    bmkggempa: {
      unavailable: 'This command has been merged into *.gempa*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('bmkggempa.unavailable'))
}
