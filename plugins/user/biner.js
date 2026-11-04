export const config = {
  name: 'biner',
  alias: ['binary'],
  category: 'user',
  description: { id: 'Ubah teks menjadi biner, atau biner kembali menjadi teks', en: 'Convert text to binary, or binary back to text' },
  usage: '.biner <teks atau biner>',
  example: '.biner halo',
  cooldown: 3,
}

export const i18n = {
  id: {
    biner: {
      ask: '╭─❏ 💾 「 *BINER* 」\n┊ Tulis teks atau binernya yaa: *.biner halo*\n╰━━━━━━━ {mood}',
      encoded: '╭─❏ 💾 「 *BINER* 」\n┊ {result}\n╰━━━━━━━',
      decoded: '╭─❏ 💾 「 *HASIL DECODE BINER* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
  en: {
    biner: {
      ask: '╭─❏ 💾 「 *BINARY* 」\n┊ Write the text or the binary: *.biner hello*\n╰━━━━━━━ {mood}',
      encoded: '╭─❏ 💾 「 *BINARY* 」\n┊ {result}\n╰━━━━━━━',
      decoded: '╭─❏ 💾 「 *BINARY DECODE RESULT* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.biner halo', expect: /biner|binary/i }

export function toBinary(text) {
  return [...text].map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
}

export function fromBinary(bin) {
  return bin.trim().split(/\s+/).map((tok) => String.fromCharCode(parseInt(tok, 2))).join('')
}

export async function handler(ctx) {
  const input = (ctx.text || '').trim()
  if (!input) return ctx.reply(ctx.t('biner.ask', { mood: ctx.say('mikir') }))
  const looksBinary = /^[01 ]+$/.test(input) && input.replace(/ /g, '').length % 8 === 0 && input.replace(/ /g, '').length >= 8
  if (looksBinary) return ctx.reply(ctx.t('biner.decoded', { result: fromBinary(input).slice(0, 1000) }))
  return ctx.reply(ctx.t('biner.encoded', { result: toBinary(input).slice(0, 1500) }))
}
