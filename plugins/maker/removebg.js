import { removeBackground, imageKind, MAX_INPUT_BYTES } from '../../src/scrapers/maker/removebg.js'
import { sendImage } from '../../src/ui/media.js'

// Removebg: proses foto yang dikirim (caption .removebg) atau dikutip,
// kirim balik PNG transparan hasil layanan matte Pixelcut. Bukan lagi
// balasan teks "belum tersedia".
export const config = {
  name: 'removebg',
  premium: true,
  alias: ['nobg', 'rmbg', 'hapusbg'],
  category: 'maker',
  description: { id: 'Hapus latar gambar yang dikirim atau dikutip, kirim PNG transparan', en: 'Remove the background of a sent or quoted image, send a transparent PNG' },
  usage: '.removebg (kirim atau kutip gambar)',
  example: '.removebg',
  cooldown: 10,
}

export const i18n = {
  id: {
    removebg: {
      needImage: '╭─❏ 🌫️ 「 *HAPUS LATAR* 」\n┊ Kirim gambar dengan caption *.removebg* atau kutip gambarnya dulu yaa~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *GAMBAR KEGEDEAN* 」\n┊ Mouu, gambarnya di atas *16 MB*. Coba gambar yang lebih kecil ya~\n╰━━━━━━━',
      invalid: '╭─❏ 💦 「 *BUKAN GAMBAR* 」\n┊ Berkasnya bukan gambar JPEG, PNG, atau WebP yang valid nih~\n╰━━━━━━━',
      downloadFail: '╭─❏ 💦 「 *GAGAL UNDUH GAMBAR* 」\n┊ Mouu, KANA gagal mengunduh gambarnya: *{message}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *HAPUS LATAR GAGAL* 」\n┊ Mouu, latarnya gagal dihapus: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      caption: '╭─❏ 🌫️ 「 *LATAR DIHAPUS* 」\n┊ Latarnya sudah dihapus, ini PNG transparannya~\n╰━━━━━━━',
    },
  },
  en: {
    removebg: {
      needImage: '╭─❏ 🌫️ 「 *REMOVE BACKGROUND* 」\n┊ Send an image with caption *.removebg* or quote an image first please~\n╰━━━━━━━',
      tooBig: '╭─❏ ⚠️ 「 *IMAGE TOO BIG* 」\n┊ Mouu, the image is over *16 MB*. Try a smaller image please~\n╰━━━━━━━',
      invalid: '╭─❏ 💦 「 *NOT AN IMAGE* 」\n┊ The file is not a valid JPEG, PNG, or WebP image~\n╰━━━━━━━',
      downloadFail: '╭─❏ 💦 「 *IMAGE DOWNLOAD FAILED* 」\n┊ Mouu, KANA failed to download the image: *{message}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *BACKGROUND REMOVAL FAILED* 」\n┊ Mouu, background removal failed: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      caption: '╭─❏ 🌫️ 「 *BACKGROUND REMOVED* 」\n┊ The background is removed, here is the transparent PNG~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.removebg', expect: /hapus latar|remove background/i }

// Ambil berkas gambar sumber: gambar yang dikutip lebih dulu, lalu
// gambar pada pesan perintah sendiri. Mengembalikan Buffer atau null.
export async function fetchSourceImage(ctx) {
  const normalize = (media) => {
    if (Buffer.isBuffer(media)) return media.length ? media : null
    if (Buffer.isBuffer(media?.buffer)) return media.buffer.length ? media.buffer : null
    return null
  }
  if (ctx.quoted?.message?.imageMessage) {
    return normalize(await ctx.downloadQuoted())
  }
  if (ctx.raw?.message?.imageMessage) {
    return normalize(await ctx.downloadMedia())
  }
  return null
}

export async function handler(ctx) {
  let source
  try {
    source = await fetchSourceImage(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('removebg.downloadFail', { message: err.message }))
  }
  if (!source) return ctx.reply(ctx.t('removebg.needImage'))
  if (!imageKind(source)) return ctx.reply(ctx.t('removebg.invalid'))
  if (source.length > MAX_INPUT_BYTES) return ctx.reply(ctx.t('removebg.tooBig'))

  let result
  try {
    result = await removeBackground(source)
  } catch (err) {
    return ctx.reply(ctx.t('removebg.fail', { message: err.message }))
  }
  return sendImage(ctx, result, { caption: ctx.t('removebg.caption') })
}
