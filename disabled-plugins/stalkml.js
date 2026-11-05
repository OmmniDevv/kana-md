// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: API api.isan.eu.org untuk Mobile Legends membalas 500 dan timeout dari VM; tidak ada layanan nickname ML alternatif yang terverifikasi.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'stalkml',
  alias: [],
  category: 'search',
  description: { id: 'Stalk Mobile Legends (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.stalkml',
  example: '.stalkml',
  cooldown: 5,
}

export const i18n = {
  id: {
    stalkml: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    stalkml: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('stalkml.unavailable'))
}
