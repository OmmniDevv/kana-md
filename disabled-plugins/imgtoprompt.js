// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Bot tidak punya jalur model vision yang aktif (provider AI teks saja; fitur OCR dinyatakan tidak tersedia oleh pemilik layanannya sendiri). Mengarang prompt dari gambar tanpa model vision berarti berbohong, jadi dinonaktifkan sampai ada model vision terverifikasi.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'imgtoprompt',
  alias: [],
  category: 'tools',
  description: { id: 'Gambar jadi prompt (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.imgtoprompt',
  example: '.imgtoprompt',
  cooldown: 5,
}

export const i18n = {
  id: {
    imgtoprompt: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    imgtoprompt: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('imgtoprompt.unavailable'))
}
