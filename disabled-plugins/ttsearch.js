// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Pencarian TikTok bergantung tikwm yang diblokir Cloudflare 403 dari VM; tidak ada mesin pencari TikTok publik lain yang terverifikasi.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'ttsearch',
  alias: [],
  category: 'search',
  description: { id: 'Pencarian TikTok (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.ttsearch',
  example: '.ttsearch',
  cooldown: 5,
}

export const i18n = {
  id: {
    ttsearch: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    ttsearch: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('ttsearch.unavailable'))
}
