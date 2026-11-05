// Biner ke desimal, dihitung lokal.
export const config = {
  name: 'debiner',
  alias: ['bin2dec', 'binerkedesimal'],
  category: 'tools',
  description: { id: 'Ubah angka biner menjadi desimal', en: 'Convert a binary number to decimal' },
  usage: '.debiner <biner>',
  example: '.debiner 11111111',
  cooldown: 3,
}

export const i18n = {
  id: {
    debiner: {
      needInput: '╭─❏ 🔢 「 *KETIK BINERNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.debiner 11111111* (ʜᴀɴʏᴀ ᴀɴɢᴋᴀ 0 ᴅᴀɴ 1)\n╰━━━━━━━',
      out: '╭─❏ 🔢 「 *BINER KE DESIMAL* 」\n┊ ʙɪɴᴇʀ: *{bin}*\n┊ ᴅᴇꜱɪᴍᴀʟ: *{dec}*\n┊ ᴏᴋᴛᴀʟ: *{oct}* | ʜᴇx: *{hex}*\n╰━━━━━━━',
    },
  },
  en: {
    debiner: {
      needInput: '╭─❏ 🔢 「 *TYPE THE BINARY* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.debiner 11111111* (ᴏɴʟʏ 0 ᴀɴᴅ 1)\n╰━━━━━━━',
      out: '╭─❏ 🔢 「 *BINARY TO DECIMAL* 」\n┊ ʙɪɴᴀʀʏ: *{bin}*\n┊ ᴅᴇᴄɪᴍᴀʟ: *{dec}*\n┊ ᴏᴄᴛᴀʟ: *{oct}* | ʜᴇx: *{hex}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.debiner 11111111', expect: /255/ }

export function binToDec(text) {
  const bin = String(text || '').trim().replace(/\s+/g, '')
  if (!/^[01]{1,53}$/.test(bin)) return null
  const dec = parseInt(bin, 2)
  return { bin, dec, oct: dec.toString(8), hex: dec.toString(16).toUpperCase() }
}

export async function handler(ctx) {
  const result = binToDec(ctx.text || '')
  if (!result) return ctx.reply(ctx.t('debiner.needInput'))
  return ctx.reply(ctx.t('debiner.out', result))
}
