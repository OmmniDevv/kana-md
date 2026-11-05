// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/cekip.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'ipwho',
  alias: [],
  category: 'tools',
  description: { id: 'info alamat IP (sekarang alias di .cekip)', en: 'Now an alias of .cekip' },
  usage: '.cekip',
  example: '.cekip',
  cooldown: 5,
}

export const i18n = {
  id: {
    ipwho: {
      unavailable: 'Perintah ini sudah digabung ke *.cekip* ya, pakai itu saja~',
    },
  },
  en: {
    ipwho: {
      unavailable: 'This command has been merged into *.cekip*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('ipwho.unavailable'))
}
