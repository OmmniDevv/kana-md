// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Semua jalur tikwm.com diblokir Cloudflare 403 dari VM dan api.tiklydown.eu.org gagal dihubungi; tidak ada sumber unduh TikTok terverifikasi saat ini. Perintah .tiktok yang lama memakai jalur yang sama dan perlu diaudit terpisah.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'playtiktok',
  alias: [],
  category: 'search',
  description: { id: 'Putar video TikTok (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.playtiktok',
  example: '.playtiktok',
  cooldown: 5,
}

export const i18n = {
  id: {
    playtiktok: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    playtiktok: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('playtiktok.unavailable'))
}
