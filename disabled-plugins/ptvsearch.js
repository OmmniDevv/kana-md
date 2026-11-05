// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Bergantung tikwm yang diblokir Cloudflare 403 dari VM; tidak ada alternatif terverifikasi.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'ptvsearch',
  alias: [],
  category: 'search',
  description: { id: 'Pencarian video TikTok (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.ptvsearch',
  example: '.ptvsearch',
  cooldown: 5,
}

export const i18n = {
  id: {
    ptvsearch: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    ptvsearch: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('ptvsearch.unavailable'))
}
