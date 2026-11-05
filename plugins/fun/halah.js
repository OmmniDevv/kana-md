// Halah dan Hilih: pengubah teks deterministik, logika transformasi
// disalin dari padanan Elaina-MD karena memang itulah mekanik fiturnya.
// Gaya halah mengganti vokal a, e, o, u menjadi a plus kata khusus,
// gaya hilih versi i. Teks yang sudah pernah diubah ditolak.
export const config = {
  name: 'halah',
  alias: ['hilih'],
  category: 'fun',
  description: { id: 'Ubah teks ke gaya halah, alias hilih untuk gaya i', en: 'Turn text into halah style, alias hilih for the i style' },
  usage: '.halah <teks> atau .hilih <teks>',
  example: '.halah congratulations',
  cooldown: 5,
}

export const i18n = {
  id: {
    halah: {
      usage: '╭─❏ 🔁 「 *HALAH* 」\n┊ Kirim teks setelah *.halah* atau *.hilih*, atau kutip pesan teksnya yaa~\n╰━━━━━━━',
      already: '╭─❏ 🚫 「 *HALAH* 」\n┊ Teks ini sudah pernah diubah sebelumnya~\n╰━━━━━━━',
    },
  },
  en: {
    halah: {
      usage: '╭─❏ 🔁 「 *HALAH* 」\n┊ Send text after *.halah* or *.hilih*, or quote a text message please~\n╰━━━━━━━',
      already: '╭─❏ 🚫 「 *HALAH* 」\n┊ This text has already been transformed before~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.halah halo', expect: /hala/i }

export function gayaHalah(text) {
  if (/cangratalataans|laval|rala|raward|samakan|sarang|barantaraksa|nashakaga chasata/i.test(text)) return null
  return text.replace(/[aeou]/gi, 'a').replace(/congratulations/gi, 'cangratalataans').replace(/you/gi, 'yaa').replace(/level/gi, 'laval').replace(/role/gi, 'rala').replace(/reward/gi, 'raward').replace(/semakin/gi, 'samakan').replace(/sering/gi, 'sarang').replace(/berinteraksi/gi, 'barantaraksa').replace(/dengan/gi, 'dangan').replace(/nishikigi chisato/gi, 'nashakaga chasata').replace(/money/gi, 'manay')
}

export function gayaHilih(text) {
  if (/cingritilitiins|livil|rili|riwird|simikin|siring|birintiriksi|nishikigi chisiti/i.test(text)) return null
  return text.replace(/[aeou]/gi, 'i').replace(/congratulations/gi, 'cingritilitiins').replace(/you/gi, 'yii').replace(/level/gi, 'livil').replace(/role/gi, 'rili').replace(/reward/gi, 'riwird').replace(/semakin/gi, 'simikin').replace(/sering/gi, 'siring').replace(/berinteraksi/gi, 'birintiriksi').replace(/dengan/gi, 'dingin').replace(/nishikigi chisato/gi, 'nishikigi chisiti').replace(/money/gi, 'miniy')
}

export function quotedText(ctx) {
  const m = ctx.quoted?.message
  if (!m) return ''
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ''
  )
}

// Tentukan gaya dari perintah yang dipakai. ctx.command berisi nama
// kanonis dari pipeline, jadi perintah mentah di pesan asli ikut
// diperiksa supaya alias .hilih tetap menghasilkan gaya hilih.
export function halahStyle(ctx) {
  if (ctx.command === 'hilih') return 'hilih'
  const rawText =
    ctx.raw?.message?.conversation || ctx.raw?.message?.extendedTextMessage?.text || ''
  const firstWord = rawText.trim().replace(/^[.!/]/, '').split(/\s+/)[0]?.toLowerCase()
  if (firstWord === 'hilih') return 'hilih'
  return 'halah'
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim() || quotedText(ctx).trim()
  if (!text) return ctx.reply(ctx.t('halah.usage'))
  const out = halahStyle(ctx) === 'hilih' ? gayaHilih(text) : gayaHalah(text)
  if (!out) return ctx.reply(ctx.t('halah.already'))
  return ctx.reply(out)
}
