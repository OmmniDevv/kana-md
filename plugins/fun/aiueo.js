// Ubah huruf vokal teks jadi satu vokal pilihan (gaya bercanda aiueo).
export const VOWELS = ['a', 'i', 'u', 'e', 'o']

export function toVowel(text, vowel) {
  return text.replace(/[aiueo]/gi, (ch) => (ch === ch.toUpperCase() ? vowel.toUpperCase() : vowel))
}

export const config = {
  name: 'aiueo',
  alias: ['vokal'],
  category: 'fun',
  description: { id: 'Ubah semua vokal teks jadi satu huruf vokal', en: 'Replace every vowel in text with one vowel letter' },
  usage: '.aiueo <vokal> <teks>',
  example: '.aiueo i selamat pagi semua',
  cooldown: 3,
}

export const i18n = {
  id: { aiueo: { hint: '╭─❏ ✏️ 「 *AIUEO* 」\n┊ Tulis vokal dan teksnya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.aiueo i selamat pagi semua*\n╰━━━━━━━', body: '╭─❏ ✏️ 「 *AIUEO* 」\n┊ {result}\n╰━━━━━━━' } },
  en: { aiueo: { hint: '╭─❏ ✏️ 「 *AIUEO* 」\n┊ Write the vowel and the text please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.aiueo i good morning everyone*\n╰━━━━━━━', body: '╭─❏ ✏️ 「 *AIUEO* 」\n┊ {result}\n╰━━━━━━━' } },
}

export const test = { input: '.aiueo', expect: /vokal|vowel/i }

export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  const space = raw.indexOf(' ')
  const vowel = space > 0 ? raw.slice(0, space).toLowerCase() : ''
  if (!VOWELS.includes(vowel) || space < 0) return ctx.reply(ctx.t('aiueo.hint'))
  return ctx.reply(ctx.t('aiueo.body', { result: toVowel(raw.slice(space + 1), vowel) }))
}
