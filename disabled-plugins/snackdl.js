// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Tidak ada URL tontonan publik SnackVideo yang bisa diverifikasi dari VM: pencarian web tidak memberi tautan watch yang valid dan beranda tidak memuat metadata video. Dicoba Bing dan DuckDuckGo 2026-11-05.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'snackdl',
  alias: [],
  category: 'download',
  description: { id: 'Video SnackVideo (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.snackdl',
  example: '.snackdl',
  cooldown: 5,
}

export const i18n = {
  id: {
    snackdl: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    snackdl: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('snackdl.unavailable'))
}
