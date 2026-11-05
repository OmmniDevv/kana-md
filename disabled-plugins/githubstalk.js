// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/tools/github.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'githubstalk',
  alias: [],
  category: 'search',
  description: { id: 'profil GitHub (sekarang alias di .github)', en: 'Now an alias of .github' },
  usage: '.github',
  example: '.github',
  cooldown: 5,
}

export const i18n = {
  id: {
    githubstalk: {
      unavailable: 'Perintah ini sudah digabung ke *.github* ya, pakai itu saja~',
    },
  },
  en: {
    githubstalk: {
      unavailable: 'This command has been merged into *.github*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('githubstalk.unavailable'))
}
