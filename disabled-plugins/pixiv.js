// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Endpoint ajax Pixiv membalas 403 dari VM bot untuk semua kata kunci; tidak ada cermin publik yang terverifikasi.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'pixiv',
  alias: [],
  category: 'search',
  description: { id: 'Pencarian Pixiv (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.pixiv',
  example: '.pixiv',
  cooldown: 5,
}

export const i18n = {
  id: {
    pixiv: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    pixiv: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('pixiv.unavailable'))
}
