// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Jalur TikTok-nya bergantung tikwm yang mati dari VM; tidak ada alternatif terverifikasi. Untuk lagu SoundCloud murni pakai .playsoundcloud.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'tiktoksc',
  alias: [],
  category: 'search',
  description: { id: 'TikTok ke SoundCloud (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.tiktoksc',
  example: '.tiktoksc',
  cooldown: 5,
}

export const i18n = {
  id: {
    tiktoksc: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    tiktoksc: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('tiktoksc.unavailable'))
}
