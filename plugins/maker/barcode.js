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
  id: { barcode: { hint: 'Tulis teks barcodenya yaa~ Contoh: .barcode KANA-2026-001', caption: 'Nih barcodenya~ 📊', fail: 'Gagal buat barcodenya: {error}' } },
  en: { barcode: { hint: 'Write the barcode text please~ Example: .barcode KANA-2026-001', caption: 'Here is your barcode~ 📊', fail: 'Failed to make the barcode: {error}' } },
}

export const test = { input: '.barcode', expect: /barcode/i }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 60)
  if (!text) return ctx.reply(ctx.t('barcode.hint'))
  try {
    const media = await downloadBuffer(`https://barcodeapi.org/api/128/${encodeURIComponent(text)}`, { maxBytes: 2 * 1024 * 1024 })
    return sendImage(ctx, media.buffer, { caption: ctx.t('barcode.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('barcode.fail', { error: err.message }))
  }
}
