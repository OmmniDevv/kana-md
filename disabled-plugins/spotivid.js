// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/maker/tovn.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'spotivid',
  alias: [],
  category: 'tools',
  description: { id: 'video jadi voice note (sekarang alias di .tovn)', en: 'Now an alias of .tovn' },
  usage: '.tovn',
  example: '.tovn',
  cooldown: 5,
}

export const i18n = {
  id: {
    spotivid: {
      unavailable: 'Perintah ini sudah digabung ke *.tovn* ya, pakai itu saja~',
    },
  },
  en: {
    spotivid: {
      unavailable: 'This command has been merged into *.tovn*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('spotivid.unavailable'))
}
