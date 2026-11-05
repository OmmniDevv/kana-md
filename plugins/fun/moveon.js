import { sendButtons } from '../../src/ui/buttons.js'

// Moveon: urutan langkah moveon.exe seperti padanan Elaina-MD, tetapi
// dikirim sebagai SATU pesan utuh (versi Elaina mengirim belasan pesan
// terjadwal). Diakhiri satu alasan gagal acak dari daftar.
export const config = {
  name: 'moveon',
  alias: [],
  category: 'fun',
  description: { id: 'Jalankan moveon.exe: hapus kenangan mantan dalam satu pesan', en: 'Run moveon.exe: delete ex memories in one message' },
  usage: '.moveon',
  example: '.moveon',
  cooldown: 5,
}

export const MOVEON_STEPS = [
  '⏳ *Menjalankan perintah: moveon.exe*',
  '⌛ Mengakses direktori kenangan...',
  '⌛ Menemukan 1.042 file terkait: mantan.jpg, tawa.mp3, chat_kita.txt, pelukan terakhir.mp4',
  '⌛ Menghapus file: mantan.jpg',
  '⌛ Menghapus file: tawa.mp3',
  '⌛ Menghapus file: chat_kita.txt',
  '⌛ Menghapus file: pelukan terakhir.mp4',
  '⌛ Membersihkan folder: /hati/kenangan/spesial',
  '⌛ Menghapus log malam_nangis.log',
  '⌛ Menghapus config: harapan.yaml',
  '⌛ Menonaktifkan modul: berharap_lagi.dll',
  '⌛ Menutup port luka_terbuka 4040',
  '⌛ Mencabut izin akses memori emosional',
  '⌛ Restart sistem perasaan...',
  '⌛ Verifikasi status...',
  '❌ *Gagal*',
]

export const MOVEON_FAIL_REASONS = [
  'Masih menyimpan fotonya di galeri',
  'Masih suka stalking story-nya tiap malam',
  "File hati sedang digunakan oleh proses lain: 'rindu.exe'",
  'Gagal menghapus karena kenangan terlalu dalam',
  'Sistem mendeteksi denyut jantung meningkat saat melihat namanya',
  "Modul 'ikhlas.dll' belum terpasang",
  'Masih berharap tanpa sadar',
  'Masih ingat semua kata sandi dia',
  "Proses move on terhenti, karena lagu 'Kenangan Manis.mp3' diputar kembali",
  'Chat terakhir belum dihapus, masih dibaca berulang-ulang',
]

export const i18n = {
  id: {
    moveon: {
      title: 'Move On',
      result: '╭─❏ 💔 「 *MOVEON.EXE* 」\n┊\n{steps}\n┊\n┊ *Error: {reason}*\n╰━━━━━━━',
      btnAgain: 'Coba Lagi',
    },
  },
  en: {
    moveon: {
      title: 'Move On',
      result: '╭─❏ 💔 「 *MOVEON.EXE* 」\n┊\n{steps}\n┊\n┊ *Error: {reason}*\n╰━━━━━━━',
      btnAgain: 'Try Again',
    },
  },
}

export const test = { input: '.moveon', expect: /moveon/i }

export function pickFailReason(rng = Math.random) {
  return MOVEON_FAIL_REASONS[Math.min(MOVEON_FAIL_REASONS.length - 1, Math.floor(rng() * MOVEON_FAIL_REASONS.length))]
}

export function formatMoveon(t, reason) {
  const steps = MOVEON_STEPS.map((step) => `┊ ${step}`).join('\n')
  return t('moveon.result', { steps, reason })
}

export async function handler(ctx) {
  const body = formatMoveon(ctx.t, pickFailReason())
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('moveon.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('moveon.btnAgain'), id: '.moveon' }],
    textFallback: body,
  })
}
