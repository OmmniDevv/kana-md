import { fakeDiscordCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'fakediscord',
  alias: ['fakediscoard'],
  category: 'maker',
  description: { id: 'Buat kartu pesan Discord versi meme berlabel jelas', en: 'Make a clearly labeled meme Discord message card' },
  usage: '.fakediscord <nama> | <isi pesan>',
  example: '.fakediscord Malik | Besok kita push fitur baru',
  cooldown: 8,
}

export const i18n = {
  id: { fakediscord: { hint: '╭─❏ 💬 「 *FORMAT FAKEDISCORD* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.fakediscord <nama> | <isi pesan>*\n┊ ᴄᴏɴᴛᴏʜ: *.fakediscord Malik | Besok kita push fitur baru*\n╰━━━━━━━', caption: '╭─❏ 💬 「 *KARTU DISCORD JADI* 」\n┊ Kartu Discord meme kamu jadii~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN KARTU* 」\n┊ Mouu, gagal bikin kartunya: *{error}*~\n╰━━━━━━━' } },
  en: { fakediscord: { hint: '╭─❏ 💬 「 *FAKEDISCORD FORMAT* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.fakediscord <name> | <message text>*\n┊ ᴇxᴀᴍᴘʟᴇ: *.fakediscord Malik | We ship the new feature tomorrow*\n╰━━━━━━━', caption: '╭─❏ 💬 「 *DISCORD CARD READY* 」\n┊ Your meme Discord card is ready~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *CARD FAILED* 」\n┊ Mouu, failed to make the card: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.fakediscord Malik | Besok kita rilis fitur baru', expect: /KARTU DISCORD JADI|DISCORD CARD READY/ }

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
    return sendImage(ctx, png, { caption: ctx.t('fakediscord.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('fakediscord.fail', { error: err.message }))
  }
}
