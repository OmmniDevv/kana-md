// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: API Meigen membalas 404 dari VM (layanan berubah/berhenti); tidak ada alternatif gambar setara yang terverifikasi untuk perintah ini.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'meigen',
  alias: [],
  category: 'search',
  description: { id: 'Generate gambar Meigen (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.meigen',
  example: '.meigen',
  cooldown: 5,
}

export const i18n = {
  id: {
    meigen: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    meigen: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('meigen.unavailable'))
}
