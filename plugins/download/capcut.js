import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'capcut',
  alias: ['ccdl'],
  category: 'download',
  description: { id: 'Unduh video CapCut (belum tersedia di rilis ini)', en: 'Download CapCut videos (not available in this release)' },
  usage: '.capcut <link capcut>',
  example: '.capcut https://www.capcut.com/template-detail/xxxx',
  cooldown: 5,
}

export const i18n = {
  id: {
    capcut: {
      unavailable: 'Mouu, pengunduh CapCut belum tersedia di rilis ini. Belum ada sumber publik gratis yang terverifikasi buat CapCut, jadi KANA nggak mau mengarang cara. Coba .aio buat link dari platform lain yaa~',
      btnAio: 'Coba .aio',
      btnMenu: 'Menu unduhan',
    },
  },
  en: {
    capcut: {
      unavailable: 'Mouu, the CapCut downloader is not available in this release yet. There is no verified free public source for CapCut, so KANA will not make one up. Try .aio for links from other platforms~',
      btnAio: 'Try .aio',
      btnMenu: 'Download menu',
    },
  },
}

export async function handler(ctx) {
  const body = ctx.t('capcut.unavailable')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('capcut.btnAio'), id: '.aio' },
      { text: ctx.t('capcut.btnMenu'), id: '.menu download' },
    ],
    textFallback: body,
  })
}
