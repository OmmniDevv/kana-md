// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/maker/hd.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'hd8',
  alias: [],
  category: 'tools',
  description: { id: 'peningkat kualitas gambar (sekarang alias di .hd)', en: 'Now an alias of .hd' },
  usage: '.hd',
  example: '.hd',
  cooldown: 5,
}

export const i18n = {
  id: {
    hd8: {
      unavailable: 'Perintah ini sudah digabung ke *.hd* ya, pakai itu saja~',
    },
  },
  en: {
    hd8: {
      unavailable: 'This command has been merged into *.hd*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('hd8.unavailable'))
}
