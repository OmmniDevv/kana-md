// Teks ke biner per karakter (kode ASCII/UTF-8), dihitung lokal.
export const config = {
  name: 'ebinary',
  alias: ['text2bin', 'tekskebiner'],
  category: 'tools',
  description: { id: 'Ubah teks menjadi kode biner per karakter', en: 'Convert text into per-character binary code' },
  usage: '.ebinary <teks>',
  example: '.ebinary halo',
  cooldown: 3,
}

export const i18n = {
  id: {
    ebinary: {
      needInput: '╭─❏ 🔤 「 *KETIK TEKSNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.ebinary halo* (ᴍᴀᴋꜱ 100 ᴋᴀʀᴀᴋᴛᴇʀ)\n╰━━━━━━━',
      out: '╭─❏ 🔤 「 *TEKS KE BINER* 」\n┊ ᴛᴇᴋꜱ: *{text}*\n┊ ʙɪɴᴇʀ:\n┊ {bin}\n╰━━━━━━━',
    },
  },
  en: {
    ebinary: {
      needInput: '╭─❏ 🔤 「 *TYPE THE TEXT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.ebinary halo* (ᴍᴀx 100 ᴄʜᴀʀᴀᴄᴛᴇʀꜱ)\n╰━━━━━━━',
      out: '╭─❏ 🔤 「 *TEXT TO BINARY* 」\n┊ ᴛᴇxᴛ: *{text}*\n┊ ʙɪɴᴀʀʏ:\n┊ {bin}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ebinary halo', expect: /01101000/ }

export function textToBinary(text) {
  const bytes = Buffer.from(String(text || ''), 'utf8')
  return [...bytes].map((b) => b.toString(2).padStart(8, '0')).join(' ')
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 100)
  if (!text) return ctx.reply(ctx.t('ebinary.needInput'))
  return ctx.reply(ctx.t('ebinary.out', { text, bin: textToBinary(text) }))
}
