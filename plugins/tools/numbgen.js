import { randomInt } from 'node:crypto'

// Pembangkit angka acak lokal (crypto). Format: tanpa argumen berarti
// 1 angka dari 1 sampai 100; argumen: [min] [max] [jumlah].
export const config = {
  name: 'numbgen',
  alias: ['randomnum', 'angkacak'],
  category: 'tools',
  description: { id: 'Hasilkan angka acak dalam rentang tertentu', en: 'Generate random numbers in a range' },
  usage: '.numbgen [min] [max] [jumlah]',
  example: '.numbgen 1 100 5',
  cooldown: 3,
}

export const i18n = {
  id: {
    numbgen: {
      badRange: '╭─❏ 🤔 「 *RENTANG SALAH* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.numbgen [min] [max] [jumlah]*, ᴍᴀᴋꜱ ᴊᴜᴍʟᴀʜ 20, max harus lebih besar dari min~\n╰━━━━━━━',
      out: '╭─❏ 🎲 「 *ANGKA ACAK* 」\n┊ ʀᴇɴᴛᴀɴɢ: *{min} sampai {max}* ({count}x)\n┊ ʜᴀꜱɪʟ: *{numbers}*\n╰━━━━━━━',
    },
  },
  en: {
    numbgen: {
      badRange: '╭─❏ 🤔 「 *BAD RANGE* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.numbgen [min] [max] [count]*, ᴍᴀx ᴄᴏᴜɴᴛ 20, max must exceed min~\n╰━━━━━━━',
      out: '╭─❏ 🎲 「 *RANDOM NUMBERS* 」\n┊ ʀᴀɴɢᴇ: *{min} to {max}* ({count}x)\n┊ ʀᴇꜱᴜʟᴛ: *{numbers}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.numbgen 1 100 3', expect: /ANGKA ACAK|RANDOM NUMBERS/ }

// Urai dan acak angka sesuai argumen.
export function rollNumbers(text) {
  const parts = String(text || '').trim().split(/\s+/).filter(Boolean).map(Number)
  if (parts.some((n) => !Number.isFinite(n))) return null
  const [min = 1, max = 100, countRaw = 1] = parts
  const count = Math.min(Math.max(Math.trunc(countRaw), 1), 20)
  if (max <= min || max - min > 1e12) return null
  const numbers = Array.from({ length: count }, () => randomInt(Math.trunc(min), Math.trunc(max) + 1))
  return { min: Math.trunc(min), max: Math.trunc(max), count, numbers }
}

export async function handler(ctx) {
  const result = rollNumbers(ctx.text || '')
  if (!result) return ctx.reply(ctx.t('numbgen.badRange'))
  return ctx.reply(ctx.t('numbgen.out', { ...result, numbers: result.numbers.join(', ') }))
}
