import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'sendkontak',
  alias: ['kirimkontak'],
  category: 'group',
  description: { id: 'Kirim kartu kontak nomor kamu sendiri, user yang di-tag, atau bot', en: 'Send a contact card of your own number, a tagged user, or the bot' },
  usage: '.sendkontak [@user]',
  example: '.sendkontak',
  cooldown: 5,
}

export const i18n = {
  id: { sendkontak: { fail: '╭─❏ ⚠️ 「 *GAGAL KIRIM KONTAK* 」\n┊ Gagal kirim kartu kontak: {error}\n╰━━━━━━━' } },
  en: { sendkontak: { fail: '╭─❏ ⚠️ 「 *FAILED TO SEND CONTACT* 」\n┊ Failed to send the contact card: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.sendkontak', expect: /kontak|contact/i }

export function buildVcard(name, digits) {
  return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${digits}:+${digits}\nEND:VCARD`
}

export async function handler(ctx) {
  const target = ctx.mentionedJids?.[0] ?? ctx.sender
  const digits = digitsOf(target)
  const name = target === ctx.sender ? ctx.pushName || digits : digits
  try {
    await ctx.sock.sendMessage(ctx.chat, {
      contacts: {
        displayName: name,
        contacts: [{ displayName: name, vcard: buildVcard(name, digits) }],
      },
    }, { quoted: ctx.raw })
  } catch (err) {
    return ctx.reply(ctx.t('sendkontak.fail', { error: err.message }))
  }
}
