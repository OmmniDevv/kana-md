// Barcode generator: gambar barcode dari barcodeapi.org (layanan gambar
// barcode publik). Teks menjadi barcode Code128.
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'barcode',
  alias: ['buatbarcode'],
  category: 'maker',
  description: { id: 'Buat gambar barcode Code128 dari teks', en: 'Make a Code128 barcode image from text' },
  usage: '.barcode <teks>',
  example: '.barcode KANA-2026-001',
  cooldown: 8,
}

export const i18n = {
  id: { barcode: { hint: '╭─❏ 📊 「 *BUTUH TEKS* 」\n┊ Tulis teks barcodenya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.barcode KANA-2026-001*\n╰━━━━━━━', caption: '╭─❏ 📊 「 *BARCODE JADI* 」\n┊ Nih barcodenya, barcode *{text}* sudah jadii~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BUAT BARCODE* 」\n┊ Mouu, gagal buat barcodenya: *{error}*~\n╰━━━━━━━' } },
  en: { barcode: { hint: '╭─❏ 📊 「 *TEXT NEEDED* 」\n┊ Write the barcode text please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.barcode KANA-2026-001*\n╰━━━━━━━', caption: '╭─❏ 📊 「 *BARCODE READY* 」\n┊ Here is your barcode, barcode *{text}* is ready~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *BARCODE FAILED* 」\n┊ Mouu, failed to make the barcode: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.barcode', expect: /barcode/i }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 60)
  if (!text) return ctx.reply(ctx.t('barcode.hint'))
  try {
    const media = await downloadBuffer(`https://barcodeapi.org/api/128/${encodeURIComponent(text)}`, { maxBytes: 2 * 1024 * 1024 })
    return sendImage(ctx, media.buffer, { caption: ctx.t('barcode.caption', { text }) })
  } catch (err) {
    return ctx.reply(ctx.t('barcode.fail', { error: err.message }))
  }
}
