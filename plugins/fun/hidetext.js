// Sembunyikan teks di balik karakter tak terlihat: teks asli disisipkan
// di antara penanda U+200E sehingga yang terlihat hanya teks sampul.
// Pendamping .readmore untuk menyembunyikan spoiler pendek.
const MARK = '‎'

export function hideText(cover, secret) {
  return `${cover} ${MARK}${MARK}${secret}${MARK}${MARK}`
}

export const config = {
  name: 'hidetext',
  alias: ['teksembunyi', 'hiddentext'],
  category: 'fun',
  description: { id: 'Sembunyikan teks rahasia di balik teks sampul (karakter tak terlihat)', en: 'Hide secret text behind cover text using invisible characters' },
  usage: '.hidetext <sampul> | <rahasia>',
  example: '.hidetext Halo semua | ini spoiler endingnya',
  cooldown: 3,
}

export const i18n = {
  id: { hidetext: { hint: '╭─❏ 🙈 「 *SEMBUNYIKAN TEKS* 」\n┊ Formatnya: *.hidetext <teks sampul> | <teks rahasia>*\n┊ Contoh: *.hidetext Halo semua | ini spoiler endingnya*\n╰━━━━━━━' } },
  en: { hidetext: { hint: '╭─❏ 🙈 「 *HIDE TEXT* 」\n┊ Format: *.hidetext <cover text> | <secret text>*\n┊ Example: *.hidetext Hello everyone | this is the ending spoiler*\n╰━━━━━━━' } },
}

export const test = { input: '.hidetext', expect: /sampul|cover/i }

export async function handler(ctx) {
  const raw = (ctx.text || '')
  const sep = raw.indexOf('|')
  if (sep < 1) return ctx.reply(ctx.t('hidetext.hint'))
  const cover = raw.slice(0, sep).trim()
  const secret = raw.slice(sep + 1).trim()
  if (!cover || !secret) return ctx.reply(ctx.t('hidetext.hint'))
  return ctx.reply(hideText(cover, secret))
}
