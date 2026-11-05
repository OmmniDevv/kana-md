// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/qr.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'txt2qr',
  alias: [],
  category: 'tools',
  description: { id: 'pembuat QR dari teks (sekarang alias di .qr)', en: 'Now an alias of .qr' },
  usage: '.qr',
  example: '.qr',
  cooldown: 5,
}

export const i18n = {
  id: {
    txt2qr: {
      unavailable: 'Perintah ini sudah digabung ke *.qr* ya, pakai itu saja~',
    },
  },
  en: {
    txt2qr: {
      unavailable: 'This command has been merged into *.qr*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('txt2qr.unavailable'))
}
