// Desimal ke biner, dihitung lokal.
export const config = {
  name: 'dbinary',
  alias: ['dec2bin', 'desimalkebiner'],
  category: 'tools',
  description: { id: 'Ubah angka desimal menjadi biner', en: 'Convert a decimal number to binary' },
  usage: '.dbinary <angka>',
  example: '.dbinary 255',
  cooldown: 3,
}

export const i18n = {
  id: {
    dbinary: {
      needInput: '╭─❏ 🔢 「 *KETIK ANGKANYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.dbinary 255*\n╰━━━━━━━',
      out: '╭─❏ 🔢 「 *DESIMAL KE BINER* 」\n┊ ᴅᴇꜱɪᴍᴀʟ: *{dec}*\n┊ ʙɪɴᴇʀ: *{bin}*\n┊ ᴏᴋᴛᴀʟ: *{oct}* | ʜᴇx: *{hex}*\n╰━━━━━━━',
    },
  },
  en: {
    dbinary: {
      needInput: '╭─❏ 🔢 「 *TYPE THE NUMBER* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.dbinary 255*\n╰━━━━━━━',
      out: '╭─❏ 🔢 「 *DECIMAL TO BINARY* 」\n┊ ᴅᴇᴄɪᴍᴀʟ: *{dec}*\n┊ ʙɪɴᴀʀʏ: *{bin}*\n┊ ᴏᴄᴛᴀʟ: *{oct}* | ʜᴇx: *{hex}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.dbinary 255', expect: /11111111/ }

export function decToBin(text) {
  const n = Number(String(text || '').trim())
  if (!Number.isSafeInteger(n) || n < 0) return null
  return { dec: n, bin: n.toString(2), oct: n.toString(8), hex: n.toString(16).toUpperCase() }
}

export async function handler(ctx) {
  const result = decToBin(ctx.text || '')
  if (!result) return ctx.reply(ctx.t('dbinary.needInput'))
  return ctx.reply(ctx.t('dbinary.out', result))
}
