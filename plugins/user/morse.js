export const config = {
  name: 'morse',
  alias: [],
  category: 'user',
  description: { id: 'Ubah teks menjadi kode morse, atau kode morse kembali menjadi teks', en: 'Convert text to morse code, or morse code back to text' },
  usage: '.morse <teks atau kode morse>',
  example: '.morse halo dunia',
  cooldown: 3,
}

const MORSE = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---',
  k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-',
  u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', ' ': '/',
}
const FROM_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]))

export const i18n = {
  id: {
    morse: {
      ask: '╭─❏ 📡 「 *KODE MORSE* 」\n┊ Tulis teks atau kode morsenya yaa: *.morse halo dunia*\n╰━━━━━━━ {mood}',
      encoded: '╭─❏ 📡 「 *KODE MORSE* 」\n┊ {result}\n╰━━━━━━━',
      decoded: '╭─❏ 📡 「 *HASIL DECODE MORSE* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
  en: {
    morse: {
      ask: '╭─❏ 📡 「 *MORSE CODE* 」\n┊ Write the text or the morse code: *.morse hello world*\n╰━━━━━━━ {mood}',
      encoded: '╭─❏ 📡 「 *MORSE CODE* 」\n┊ {result}\n╰━━━━━━━',
      decoded: '╭─❏ 📡 「 *MORSE DECODE RESULT* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.morse halo', expect: /morse/i }

export function toMorse(text) {
  return text.toLowerCase().split('').map((ch) => MORSE[ch] ?? '').filter(Boolean).join(' ')
}

export function fromMorse(code) {
  return code.trim().split(/\s+/).map((tok) => (tok === '/' ? ' ' : FROM_MORSE[tok] ?? '')).join('')
}

export async function handler(ctx) {
  const input = (ctx.text || '').trim()
  if (!input) return ctx.reply(ctx.t('morse.ask', { mood: ctx.say('mikir') }))
  const looksMorse = /^[.\-/ ]+$/.test(input) && /[.-]/.test(input)
  if (looksMorse) return ctx.reply(ctx.t('morse.decoded', { result: fromMorse(input).slice(0, 1000) }))
  return ctx.reply(ctx.t('morse.encoded', { result: toMorse(input).slice(0, 1500) }))
}
