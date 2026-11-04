import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'removebg',
  alias: [],
  category: 'maker',
  description: { id: 'Hapus latar gambar (belum tersedia, dijelaskan jujur)', en: 'Remove image background (not available yet, honestly explained)' },
  usage: '.removebg (kutip gambar)',
  example: '.removebg',
  cooldown: 3,
}

export const i18n = {
  id: {
    removebg: {
      unavailable:
        'Mouu, fitur hapus latar belum tersedia yaa. KANA nggak punya cara lokal yang gratis dan nyata buat ini tanpa model AI atau API key berbayar, jadi KANA nggak mau pura-pura memproses. Sementara, gambarnya bisa diperbesar pakai .hd~',
      hdButton: 'Perbesar (.hd)',
      menuButton: 'Menu Maker',
    },
  },
  en: {
    removebg: {
      unavailable:
        'Mouu, background removal is not available yet. KANA has no real free local way to do this without an AI model or a paid API key, so KANA will not pretend to process it. For now, your image can be upscaled with .hd~',
      hdButton: 'Upscale (.hd)',
      menuButton: 'Maker Menu',
    },
  },
}

export async function handler(ctx) {
  await ctx.reply(ctx.t('removebg.unavailable'))
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body: ctx.t('removebg.unavailable'),
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('removebg.hdButton'), id: '.hd' },
      { text: ctx.t('removebg.menuButton'), id: '.menu maker' },
    ],
    textFallback: ctx.t('removebg.unavailable'),
  })
}
