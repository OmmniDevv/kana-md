export const config = {
  name: 'ocr',
  premium: true,
  alias: ['bacateks', 'imagetotext', 'totext'],
  category: 'search',
  description: { id: 'Baca teks dari gambar (belum tersedia di rilis ini)', en: 'Read text from an image (not available in this release)' },
  usage: '.ocr (balas gambar)',
  example: '.ocr',
  cooldown: 5,
}

export const i18n = {
  id: {
    ocr: {
      noImage: '╭─❏ 🔍 「 *OCR* 」\n┊ Balas gambar yang mau dibaca teksnya dulu yaa~\n┊ Baru ketik *.ocr*\n╰━━━━━━━',
      unavailable: '╭─❏ 🌸 「 *OCR BELUM TERSEDIA* 」\n┊ Mouu, fitur OCR belum tersedia di rilis ini~\n┊ Mesin OCR yang ringan belum ada yang cocok dipasang di KANA, jadi KANA nggak mau pura-pura bisa~\n┊ Nanti kalau sudah siap, KANA kabari yaa~\n╰━━━━━━━',
    },
  },
  en: {
    ocr: {
      noImage: '╭─❏ 🔍 「 *OCR* 」\n┊ Reply to the image whose text you want read first~\n┊ Then type *.ocr*\n╰━━━━━━━',
      unavailable: '╭─❏ 🌸 「 *OCR NOT AVAILABLE YET* 」\n┊ Mouu, the OCR feature is not available in this release yet~\n┊ No lightweight OCR engine fits KANA so far, so KANA will not pretend it works~\n┊ KANA will let you know once it is ready~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ocr', expect: /gambar|ocr/i }

export async function handler(ctx) {
  const hasImage = Boolean(
    ctx.quoted?.message?.imageMessage ||
      ctx.quoted?.message?.documentMessage ||
      ctx.raw?.message?.imageMessage
  )
  if (!hasImage) return ctx.reply(ctx.t('ocr.noImage'))
  return ctx.reply(ctx.t('ocr.unavailable'))
}
