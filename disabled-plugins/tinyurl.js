// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/shortlink.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'tinyurl',
  alias: [],
  category: 'tools',
  description: { id: 'pemendek tautan TinyURL (sekarang alias di .shortlink)', en: 'Now an alias of .shortlink' },
  usage: '.shortlink',
  example: '.shortlink',
  cooldown: 5,
}

export const i18n = {
  id: {
    tinyurl: {
      unavailable: 'Perintah ini sudah digabung ke *.shortlink* ya, pakai itu saja~',
    },
  },
  en: {
    tinyurl: {
      unavailable: 'This command has been merged into *.shortlink*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('tinyurl.unavailable'))
}
