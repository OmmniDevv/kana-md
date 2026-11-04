import { fakeDiscordCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'fakediscord',
  alias: ['fdc', 'fakediscoard'],
  category: 'maker',
  description: { id: 'Buat kartu pesan Discord versi meme berlabel jelas', en: 'Make a clearly labeled meme Discord message card' },
  usage: '.fakediscord <nama> | <isi pesan>',
  example: '.fakediscord Malik | Besok kita push fitur baru',
  cooldown: 8,
}

export const i18n = {
  id: { fakediscord: { hint: 'Formatnya: .fakediscord <nama> | <isi pesan>. Contoh: .fakediscord Malik | Besok kita push fitur baru', fail: 'Gagal bikin kartunya: {error}' } },
  en: { fakediscord: { hint: 'Format: .fakediscord <name> | <message text>. Example: .fakediscord Malik | We ship the new feature tomorrow', fail: 'Failed to make the card: {error}' } },
}

export const test = { input: '.fakediscord', expect: /fakediscord/i }

export async function handler(ctx) {
  const raw = ctx.text || ''
  const sep = raw.indexOf('|')
  if (sep < 1) return ctx.reply(ctx.t('fakediscord.hint'))
  const name = raw.slice(0, sep).trim().slice(0, 30)
  const text = raw.slice(sep + 1).trim().slice(0, 220)
  if (!name || !text) return ctx.reply(ctx.t('fakediscord.hint'))
  try {
    const now = new Date()
    const time = `Hari ini ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`
    const png = await fakeDiscordCard({ name, text, time })
    return sendImage(ctx, png, {})
  } catch (err) {
    return ctx.reply(ctx.t('fakediscord.fail', { error: err.message }))
  }
}
