export const config = {
  name: 'alay',
  alias: [],
  category: 'fun',
  description: { id: 'Ubah teks jadi gaya alay (huruf besar kecil acak plus angka)', en: 'Turn text into alay style (random mixed case plus numbers)' },
  usage: '.alay <teks>',
  example: '.alay halo apa kabar',
  cooldown: 3,
}

export const i18n = {
  id: { alay: { hint: 'Tulis teksnya yaa~ Contoh: .alay halo apa kabar', body: '😜 Versi alay:\n{result}' } },
  en: { alay: { hint: 'Write the text please~ Example: .alay hello how are you', body: '😜 Alay version:\n{result}' } },
}

export const test = { input: '.alay', expect: /teks|text/i }

const SWAP = { a: '4', e: '3', i: '1', o: '0', s: '5', g: '9', b: '8', t: '7' }

export function toAlay(text) {
  return String(text).split('').map((ch, i) => {
    const lower = ch.toLowerCase()
    if (SWAP[lower] && i % 3 === 2) return SWAP[lower]
    if (/[a-z]/i.test(ch)) return i % 2 ? ch.toUpperCase() : ch.toLowerCase()
    return ch
  }).join('')
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('alay.hint'))
  return ctx.reply(ctx.t('alay.body', { result: toAlay(text.slice(0, 300)) }))
}
