export const config = {
  name: 'fliptext',
  alias: ['balikteks'],
  category: 'user',
  description: { id: 'Balik teks jadi terbalik (upside down) buat gaya-gayaan', en: 'Flip text upside down for fun styling' },
  usage: '.fliptext <teks>',
  example: '.fliptext halo semua',
  cooldown: 3,
}

const FLIP = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ',
  n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: '𐐒', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ', K: 'ʞ', L: '˥', M: 'W',
  N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ', S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  0: '0', 1: 'Ɩ', 2: 'ᄅ', 3: 'Ɛ', 4: 'ㄣ', 5: 'ϛ', 6: '9', 7: 'ㄥ', 8: '8', 9: '6',
  '.': '˙', ',': "'", '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '_': '‾', '&': '⅋',
}

export const i18n = {
  id: {
    fliptext: {
      ask: 'Tulis teksnya dulu yaa: .fliptext halo semua {mood}',
      body: '🙃 TEKS TERBALIK\n\n{result}',
    },
  },
  en: {
    fliptext: {
      ask: 'Write the text first: .fliptext hello everyone {mood}',
      body: '🙃 FLIPPED TEXT\n\n{result}',
    },
  },
}

export const test = { input: '.fliptext halo', expect: /terbalik|flipped/i }

export function flipText(text) {
  return [...text].map((ch) => FLIP[ch] ?? ch).reverse().join('')
}

export async function handler(ctx) {
  const input = (ctx.text || '').trim()
  if (!input) return ctx.reply(ctx.t('fliptext.ask', { mood: ctx.say('mikir') }))
  return ctx.reply(ctx.t('fliptext.body', { result: flipText(input).slice(0, 1000) }))
}
