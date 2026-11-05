// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/search/dnslookup.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'lookup',
  alias: [],
  category: 'tools',
  description: { id: 'DNS lookup domain (sekarang alias di .dnslookup)', en: 'Now an alias of .dnslookup' },
  usage: '.dnslookup',
  example: '.dnslookup',
  cooldown: 5,
}

export const i18n = {
  id: {
    lookup: {
      unavailable: 'Perintah ini sudah digabung ke *.dnslookup* ya, pakai itu saja~',
    },
  },
  en: {
    lookup: {
      unavailable: 'This command has been merged into *.dnslookup*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('lookup.unavailable'))
}
