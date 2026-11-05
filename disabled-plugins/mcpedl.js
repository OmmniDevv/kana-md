// DINONAKTIFKAN 2026-11-05 (perbaikan klaster KIND A): file ini dulu
// templat lookup KIND="wiki" yang membalas ringkasan Wikipedia untuk
// perintah apa pun. Alasan nonaktif: Sama seperti mcaddon: hasil MCPEDL tidak tersedia server-side dan tidak ada API publik yang menjawab dari VM.
// Lihat docs/DECISIONS.md dan kana-md-run/scratch/fix-kind-a.md.
export const config = {
  name: 'mcpedl',
  alias: [],
  category: 'search',
  description: { id: 'Konten MCPEDL (belum tersedia: tidak ada sumber terverifikasi)', en: 'Not available: no verified source' },
  usage: '.mcpedl',
  example: '.mcpedl',
  cooldown: 5,
}

export const i18n = {
  id: {
    mcpedl: {
      unavailable: 'Mouu, fitur ini belum tersedia karena belum ada sumber publik yang terverifikasi dari server bot. KANA tidak mau mengarang hasilnya~',
    },
  },
  en: {
    mcpedl: {
      unavailable: 'Mouu, this feature is not available because there is no public source verified from the bot server. KANA will not make up the result~',
    },
  },
}

export async function handler(ctx) {
  return ctx.reply(ctx.t('mcpedl.unavailable'))
}
