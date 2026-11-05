import { createCanvas, loadImage } from '@napi-rs/canvas'
import { fetchSourceImage } from '../maker/removebg.js'
import { imageKind } from '../../src/scrapers/maker/removebg.js'
import { sendImage } from '../../src/ui/media.js'

// Burik: proses foto beneran seperti padanan Elaina-MD. Gambar dari
// pesan perintah atau kutipan diturunkan ukurannya ke sekitar 100px
// lalu diencode sebagai JPEG kualitas rendah, hasilnya burik betulan.
export const config = {
  name: 'burik',
  alias: ['rusak', 'jelek'],
  category: 'fun',
  description: { id: 'Membuat foto menjadi burik: kirim atau kutip foto', en: 'Make a photo low quality: send or quote a photo' },
  usage: '.burik (kirim atau kutip foto)',
  example: '.burik',
  cooldown: 5,
}

export const i18n = {
  id: {
    burik: {
      needImage: '╭─❏ 📸 「 *FOTO BURIK* 」\n┊ Kirim foto dengan caption *.burik* atau kutip fotonya dulu yaa~\n╰━━━━━━━',
      invalid: '╭─❏ 💦 「 *BUKAN GAMBAR* 」\n┊ Berkasnya bukan gambar JPEG, PNG, atau WebP yang valid nih~\n╰━━━━━━━',
      downloadFail: '╭─❏ 💦 「 *GAGAL UNDUH FOTO* 」\n┊ Mouu, KANA gagal mengunduh fotonya: *{message}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *BURIK GAGAL* 」\n┊ Mouu, fotonya gagal dibikin burik: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📸 「 *FOTO BURIK* 」\n┊ Nah ini fotonya, sudah resmi burik~\n╰━━━━━━━',
    },
  },
  en: {
    burik: {
      needImage: '╭─❏ 📸 「 *BURIK PHOTO* 」\n┊ Send a photo with caption *.burik* or quote a photo first please~\n╰━━━━━━━',
      invalid: '╭─❏ 💦 「 *NOT AN IMAGE* 」\n┊ The file is not a valid JPEG, PNG, or WebP image~\n╰━━━━━━━',
      downloadFail: '╭─❏ 💦 「 *PHOTO DOWNLOAD FAILED* 」\n┊ Mouu, KANA failed to download the photo: *{message}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *BURIK FAILED* 」\n┊ Mouu, the photo failed to be degraded: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📸 「 *BURIK PHOTO* 」\n┊ Here is your photo, officially low quality~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.burik', expect: /foto burik|burik photo/i }

// Turunkan kualitas gambar: validasi magic bytes, gambar ulang pada
// sisi terpanjang maxSize px, encode JPEG kualitas rendah.
// Mengembalikan Buffer JPEG atau null bila masukan bukan gambar.
export async function makeBurik(buffer, { maxSize = 100, quality = 15 } = {}) {
  if (!imageKind(buffer)) return null
  const img = await loadImage(buffer)
  const scale = maxSize / Math.max(img.width, img.height)
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = createCanvas(w, h)
  const c = canvas.getContext('2d')
  c.drawImage(img, 0, 0, w, h)
  return canvas.encode('jpeg', quality)
}

export async function handler(ctx) {
  let source
  try {
    source = await fetchSourceImage(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('burik.downloadFail', { message: err.message }))
  }
  if (!source) return ctx.reply(ctx.t('burik.needImage'))
  if (!imageKind(source)) return ctx.reply(ctx.t('burik.invalid'))
  let result
  try {
    result = await makeBurik(source)
  } catch (err) {
    return ctx.reply(ctx.t('burik.fail', { message: err.message }))
  }
  if (!result) return ctx.reply(ctx.t('burik.invalid'))
  return sendImage(ctx, result, { caption: ctx.t('burik.caption') })
}
