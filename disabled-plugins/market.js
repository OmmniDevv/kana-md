// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/store/listproduk.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'market',
  alias: [],
  category: 'info',
  description: { id: 'daftar produk toko bot (sekarang alias di .listproduk)', en: 'Now an alias of .listproduk' },
  usage: '.listproduk',
  example: '.listproduk',
  cooldown: 5,
}

export const i18n = {
  id: {
    market: {
      unavailable: 'Perintah ini sudah digabung ke *.listproduk* ya, pakai itu saja~',
    },
  },
  en: {
    market: {
      unavailable: 'This command has been merged into *.listproduk*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('market.unavailable'))
}
