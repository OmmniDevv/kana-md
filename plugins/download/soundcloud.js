import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'soundcloud',
  alias: ['sc', 'scdl'],
  category: 'download',
  description: { id: 'Unduh audio SoundCloud (belum tersedia di rilis ini)', en: 'Download SoundCloud audio (not available in this release)' },
  usage: '.soundcloud <link soundcloud>',
  example: '.soundcloud https://soundcloud.com/artist/track',
  cooldown: 5,
}

export const i18n = {
  id: {
    soundcloud: {
      unavailable: 'Mouu, pengunduh SoundCloud belum tersedia di rilis ini. Belum ada sumber publik gratis yang terverifikasi buat SoundCloud, jadi KANA nggak mau mengarang cara. Coba .aio buat link lain, atau .play buat cari lagunya di YouTube yaa~',
      btnAio: 'Coba .aio',
      btnMenu: 'Menu unduhan',
    },
  },
  en: {
    soundcloud: {
      unavailable: 'Mouu, the SoundCloud downloader is not available in this release yet. There is no verified free public source for SoundCloud, so KANA will not make one up. Try .aio for other links, or .play to find the song on YouTube~',
      btnAio: 'Try .aio',
      btnMenu: 'Download menu',
    },
  },
}

export const test = { input: '.soundcloud', expect: /belum tersedia/i }

export async function handler(ctx) {
  const body = ctx.t('soundcloud.unavailable')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('soundcloud.btnAio'), id: '.aio' },
      { text: ctx.t('soundcloud.btnMenu'), id: '.menu download' },
    ],
    textFallback: body,
  })
}
