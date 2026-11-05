// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/user/kalkulator.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'calc',
  alias: [],
  category: 'tools',
  description: { id: 'kalkulator ekspresi lengkap (sekarang alias di .kalkulator)', en: 'Now an alias of .kalkulator' },
  usage: '.kalkulator',
  example: '.kalkulator',
  cooldown: 5,
}

export const i18n = {
  id: {
    calc: {
      unavailable: 'Perintah ini sudah digabung ke *.kalkulator* ya, pakai itu saja~',
    },
  },
  en: {
    calc: {
      unavailable: 'This command has been merged into *.kalkulator*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('calc.unavailable'))
}
