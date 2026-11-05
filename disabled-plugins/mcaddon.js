// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Hasil pencarian MCPEDL dirender di sisi klien; payload SSR tidak membawa hasil dan API wp-json situs mati (404). Tidak ada sumber addon terverifikasi dari VM.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'mcaddon',
  alias: [],
  category: 'search',
  description: { id: 'Addon Minecraft MCPEDL (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.mcaddon',
  example: '.mcaddon',
  cooldown: 5,
}

export const i18n = {
  id: {
    mcaddon: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    mcaddon: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('mcaddon.unavailable'))
}
