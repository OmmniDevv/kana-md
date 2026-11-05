export const config = {
  name: 'berapa',
  alias: [],
  category: 'fun',
  description: { id: 'Mesin jawab pertanyaan berapa dengan angka acak yang yakin', en: 'How-many question machine with a confident random number' },
  usage: '.berapa <pertanyaan>',
  example: '.berapa kali aku harus mencoba',
  cooldown: 3,
}

export const i18n = {
  id: { berapa: { hint: '╭─❏ 🔢 「 *BERAPA* 」\n┊ Tanya yang lengkap yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.berapa kali aku harus mencoba*\n╰━━━━━━━', body: '╭─❏ 🔢 「 *BERAPA* 」\n┊ ᴊᴀᴡᴀʙᴀɴɴʏᴀ: *{number}*\n┊ Percaya saja dulu, semesta jarang salah hitung~\n╰━━━━━━━ {mood}' } },
  en: { berapa: { hint: '╭─❏ 🔢 「 *HOW MANY* 」\n┊ Ask a full question please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.berapa how many times should I try*\n╰━━━━━━━', body: '╭─❏ 🔢 「 *HOW MANY* 」\n┊ ᴛʜᴇ ᴀɴꜱᴡᴇʀ: *{number}*\n┊ Just trust it, the universe rarely miscounts~\n╰━━━━━━━ {mood}' } },
}

export const test = { input: '.berapa kali aku harus mencoba sebelum berhasil', expect: /Percaya saja dulu|Just trust it/ }

export async function handler(ctx) {
  if (!(ctx.text || '').trim()) return ctx.reply(ctx.t('berapa.hint'))
  const number = Math.floor(Math.random() * 100) + 1
  return ctx.reply(ctx.t('berapa.body', { number, mood: ctx.say('mikir') }))
}
