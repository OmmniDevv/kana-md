import { randomInt } from 'node:crypto'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'genpass',
  alias: ['buatpassword', 'passwordgen'],
  category: 'user',
  description: { id: 'Buat kata sandi acak yang kuat dengan panjang pilihanmu', en: 'Generate a strong random password with your chosen length' },
  usage: '.genpass [panjang 6-32]',
  example: '.genpass 16',
  cooldown: 3,
}

export const i18n = {
  id: {
    genpass: {
      title: 'Generator Kata Sandi',
      body: '╭─❏ 🔐 「 *KATA SANDI BARU* 」\n┊ *{password}*\n┊ ᴘᴀɴᴊᴀɴɢ: *{length} karakter*\n╰━━━━━━━\nSimpan di tempat aman dan jangan dibagikan ke siapa pun yaa~ {mood}',
      btnAgain: '🔐 Buat Lagi',
    },
  },
  en: {
    genpass: {
      title: 'Password Generator',
      body: '╭─❏ 🔐 「 *NEW PASSWORD* 」\n┊ *{password}*\n┊ ʟᴇɴɢᴛʜ: *{length} characters*\n╰━━━━━━━\nStore it somewhere safe and never share it with anyone~ {mood}',
      btnAgain: '🔐 Generate Again',
    },
  },
}

export const test = { input: '.genpass 12', expect: /kata sandi|password/i }

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'

export function generatePassword(length = 12) {
  let out = ''
  for (let i = 0; i < length; i++) out += CHARSET[randomInt(CHARSET.length)]
  return out
}

export async function handler(ctx) {
  const parsed = parseInt((ctx.text || '').trim(), 10)
  const length = Number.isFinite(parsed) ? Math.min(32, Math.max(6, parsed)) : 12
  const body = ctx.t('genpass.body', { password: generatePassword(length), length, mood: ctx.say('sukses') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('genpass.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('genpass.btnAgain'), id: `.genpass ${length}` }],
    textFallback: body,
  })
}
