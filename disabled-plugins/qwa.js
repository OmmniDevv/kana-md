// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/maker/buatquote.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'qwa',
  alias: [],
  category: 'tools',
  description: { id: 'kartu quote WhatsApp (sekarang alias di .buatquote)', en: 'Now an alias of .buatquote' },
  usage: '.buatquote',
  example: '.buatquote',
  cooldown: 5,
}

export const i18n = {
  id: {
    qwa: {
      unavailable: 'Perintah ini sudah digabung ke *.buatquote* ya, pakai itu saja~',
    },
  },
  en: {
    qwa: {
      unavailable: 'This command has been merged into *.buatquote*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('qwa.unavailable'))
}
