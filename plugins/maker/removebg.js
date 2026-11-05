import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'removebg',
  premium: true,
  alias: ['nobg', 'rmbg'],
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
        '╭─❏ 🌫️ 「 *HAPUS LATAR BELUM TERSEDIA* 」\n┊ Mouu, fitur hapus latar belum tersedia yaa. KANA nggak punya cara lokal yang gratis dan nyata buat ini tanpa model AI atau API key berbayar, jadi KANA nggak mau pura-pura memproses.\n┊ Sementara, gambarnya bisa diperbesar pakai *.hd*~\n╰━━━━━━━',
      hdButton: 'Perbesar (.hd)',
    },
  },
  en: {
    removebg: {
      unavailable:
        '╭─❏ 🌫️ 「 *BACKGROUND REMOVAL UNAVAILABLE* 」\n┊ Mouu, background removal is not available yet. KANA has no real free local way to do this without an AI model or a paid API key, so KANA will not pretend to process it.\n┊ For now, your image can be upscaled with *.hd*~\n╰━━━━━━━',
      hdButton: 'Upscale (.hd)',
    },
  },
}

export const test = { input: '.removebg', expect: /belum tersedia/i }

export async function handler(ctx) {
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body: ctx.t('removebg.unavailable'),
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('removebg.hdButton'), id: '.hd' }],
    textFallback: ctx.t('removebg.unavailable'),
  })
}
