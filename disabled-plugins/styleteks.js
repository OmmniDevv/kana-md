// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/maker/textstyle.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'styleteks',
  alias: [],
  category: 'tools',
  description: { id: 'gaya teks fancy (sekarang alias di .textstyle)', en: 'Now an alias of .textstyle' },
  usage: '.textstyle',
  example: '.textstyle',
  cooldown: 5,
}

export const i18n = {
  id: {
    styleteks: {
      unavailable: 'Perintah ini sudah digabung ke *.textstyle* ya, pakai itu saja~',
    },
  },
  en: {
    styleteks: {
      unavailable: 'This command has been merged into *.textstyle*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('styleteks.unavailable'))
}
