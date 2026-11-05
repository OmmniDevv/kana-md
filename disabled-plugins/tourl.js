// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Fungsinya adalah duplikat murni dari plugin kanonis
// plugins/tools/upload.js dan nama ini sekarang menjadi alias di sana.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'tourl',
  alias: [],
  category: 'tools',
  description: { id: 'unggah media jadi tautan (sekarang alias di .upload)', en: 'Now an alias of .upload' },
  usage: '.upload',
  example: '.upload',
  cooldown: 5,
}

export const i18n = {
  id: {
    tourl: {
      unavailable: 'Perintah ini sudah digabung ke *.upload* ya, pakai itu saja~',
    },
  },
  en: {
    tourl: {
      unavailable: 'This command has been merged into *.upload*, please use that one~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('tourl.unavailable'))
}
