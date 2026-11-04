// DINONAKTIFKAN 2026-11-04: Threads login-wall untuk fetch server-side
// (og:title halaman adalah 'Threads - Log in' di semua UA dan domain;
// tidak ada data media tanpa sesi login). Lihat docs/DECISIONS.md.
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'threads',
  alias: ['thdl'],
  category: 'download',
  description: { id: 'Unduh media Threads (belum tersedia di rilis ini)', en: 'Download Threads media (not available in this release)' },
  usage: '.threads <link threads>',
  example: '.threads https://www.threads.net/@user/post/xxxx',
  cooldown: 5,
}

export const i18n = {
  id: {
    threads: {
      unavailable: 'Mouu, pengunduh Threads belum tersedia di rilis ini. Belum ada sumber publik gratis yang terverifikasi buat Threads, jadi KANA nggak mau mengarang cara. Coba .aio buat link dari platform lain yaa~',
      btnAio: 'Coba .aio',
      btnMenu: 'Menu unduhan',
    },
  },
  en: {
    threads: {
      unavailable: 'Mouu, the Threads downloader is not available in this release yet. There is no verified free public source for Threads, so KANA will not make one up. Try .aio for links from other platforms~',
      btnAio: 'Try .aio',
      btnMenu: 'Download menu',
    },
  },
}

export const test = { input: '.threads', expect: /belum tersedia/i }

export async function handler(ctx) {
  const body = ctx.t('threads.unavailable')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('threads.btnAio'), id: '.aio' },
      { text: ctx.t('threads.btnMenu'), id: '.menu download' },
    ],
    textFallback: body,
  })
}
