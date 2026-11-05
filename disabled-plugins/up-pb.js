// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/tools/pastebin.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'up-pb',
  alias: [],
  category: 'tools',
  description: { id: 'unggah paste teks (sekarang alias di .pastebin)', en: 'Now an alias of .pastebin' },
  usage: '.pastebin',
  example: '.pastebin',
  cooldown: 5,
}

export const i18n = {
  id: {
    up_pb: {
      unavailable: 'Perintah ini sudah digabung ke *.pastebin* ya, pakai itu saja~',
    },
  },
  en: {
    up_pb: {
      unavailable: 'This command has been merged into *.pastebin*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('up_pb.unavailable'))
}
