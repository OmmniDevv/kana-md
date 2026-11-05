// Tebalkan teks memakai karakter Unicode Mathematical Bold, lokal.
export const config = {
  name: 'tebalteks',
  alias: ['boldtext', 'teksbold'],
  category: 'tools',
  description: { id: 'Ubah teks menjadi huruf tebal Unicode', en: 'Convert text into Unicode bold letters' },
  usage: '.tebalteks <teks>',
  example: '.tebalteks halo dunia',
  cooldown: 3,
}

export const i18n = {
  id: {
    tebalteks: {
      needText: '╭─❏ 🅱️ 「 *KETIK TEKSNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.tebalteks halo dunia*\n╰━━━━━━━',
      out: '╭─❏ 🅱️ 「 *TEKS TEBAL* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
  en: {
    tebalteks: {
      needText: '╭─❏ 🅱️ 「 *TYPE THE TEXT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.tebalteks hello world*\n╰━━━━━━━',
      out: '╭─❏ 🅱️ 「 *BOLD TEXT* 」\n┊ {result}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tebalteks halo', expect: /𝐡𝐚𝐥𝐨/ }

const BOLD_MAP = {}
for (let i = 0; i < 26; i += 1) {
  BOLD_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D400 + i)
  BOLD_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D41A + i)
}
for (let i = 0; i < 10; i += 1) {
  BOLD_MAP[String(i)] = String.fromCodePoint(0x1D7CE + i)
}

// Ubah huruf dan angka ASCII menjadi varian tebal Unicode.
export function toBold(text) {
  return [...String(text || '')].map((ch) => BOLD_MAP[ch] || ch).join('')
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('tebalteks.needText'))
  return ctx.reply(ctx.t('tebalteks.out', { result: toBold(text) }))
}
