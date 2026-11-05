// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: grep.app membalas 429 (batas laju) dari VM dan GitHub Code Search wajib token; tidak ada mesin pencari kode publik yang terverifikasi dari VM.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'searchcode',
  alias: [],
  category: 'search',
  description: { id: 'Pencarian kode (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.searchcode',
  example: '.searchcode',
  cooldown: 5,
}

export const i18n = {
  id: {
    searchcode: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    searchcode: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('searchcode.unavailable'))
}
