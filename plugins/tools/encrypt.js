// Enkripsi teks ringan lokal: base64 encode/decode dan ROT13.
// Bukan kriptografi kuat; cocok untuk menyamarkan teks biasa.
export const config = {
  name: 'encrypt',
  alias: ['enkripsi'],
  category: 'tools',
  description: { id: 'Enkode teks: base64 atau ROT13 (dan dekodenya)', en: 'Encode text: base64 or ROT13 (and decode)' },
  usage: '.encrypt <base64/rot13/decode> <teks>',
  example: '.encrypt base64 halo dunia',
  cooldown: 3,
}

export const i18n = {
  id: {
    encrypt: {
      needInput: '╭─❏ 🔐 「 *FORMAT ENKRIPSI* 」\n┊ *.encrypt base64 <teks>* untuk enkode base64\n┊ *.encrypt decode <base64>* untuk dekode\n┊ *.encrypt rot13 <teks>* untuk ROT13\n╰━━━━━━━',
      out: '╭─❏ 🔐 「 *HASIL {mode}* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
  en: {
    encrypt: {
      needInput: '╭─❏ 🔐 「 *ENCRYPT FORMAT* 」\n┊ *.encrypt base64 <text>* to base64-encode\n┊ *.encrypt decode <base64>* to decode\n┊ *.encrypt rot13 <text>* for ROT13\n╰━━━━━━━',
      out: '╭─❏ 🔐 「 *{mode} RESULT* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.encrypt base64 halo', expect: /aGFsbw==/ }

export function rot13(text) {
  return String(text).replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base)
  })
}

// Jalankan mode enkripsi; null bila format tidak dikenal.
export function runEncrypt(text) {
  const src = String(text || '').trim()
  const m = src.match(/^(base64|decode|rot13)\s+([\s\S]+)$/i)
  if (!m) {
    if (!src) return null
    return { mode: 'BASE64', result: Buffer.from(src, 'utf8').toString('base64') }
  }
  const mode = m[1].toLowerCase()
  const payload = m[2].trim()
  if (mode === 'decode') {
    try {
      const decoded = Buffer.from(payload.replace(/\s+/g, ''), 'base64').toString('utf8')
      return { mode: 'DECODE', result: decoded }
    } catch { return null }
  }
  if (mode === 'rot13') return { mode: 'ROT13', result: rot13(payload) }
  return { mode: 'BASE64', result: Buffer.from(payload, 'utf8').toString('base64') }
}

export async function handler(ctx) {
  const result = runEncrypt(ctx.text || '')
  if (!result) return ctx.reply(ctx.t('encrypt.needInput'))
  return ctx.reply(ctx.t('encrypt.out', result))
}
