// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/dafont.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'nerdfont-ambil',
  alias: [],
  category: 'search',
  description: { id: 'cari font termasuk Nerd Font (sekarang alias di .dafont)', en: 'Now an alias of .dafont' },
  usage: '.dafont',
  example: '.dafont',
  cooldown: 5,
}

export const i18n = {
  id: {
    nerdfont_ambil: {
      unavailable: 'Perintah ini sudah digabung ke *.dafont* ya, pakai itu saja~',
    },
  },
  en: {
    nerdfont_ambil: {
      unavailable: 'This command has been merged into *.dafont*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('nerdfont_ambil.unavailable'))
}
