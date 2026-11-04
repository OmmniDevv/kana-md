import { getProfile, levelFromXp, xpForLevel } from '../../src/services/user-service.js'
import { levelCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'levelcard',
  alias: ['kartulevel'],
  category: 'maker',
  description: { id: 'Kartu gambar level dan progres XP kamu', en: 'Image card of your level and XP progress' },
  usage: '.levelcard',
  example: '.levelcard',
  cooldown: 5,
}

export const i18n = {
  id: { levelcard: { caption: '╭─❏ ⭐ 「 *KARTU LEVEL* 」\n┊ ᴋᴀʀᴛᴜ ʟᴇᴠᴇʟ: *{name}*\n┊ ʟᴇᴠᴇʟ: *{level}* ⭐\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN KARTU LEVEL* 」\n┊ Mouu, gagal bikin kartu level: *{error}*~\n╰━━━━━━━' } },
  en: { levelcard: { caption: '╭─❏ ⭐ 「 *LEVEL CARD* 」\n┊ ʟᴇᴠᴇʟ ᴄᴀʀᴅ: *{name}*\n┊ ʟᴇᴠᴇʟ: *{level}* ⭐\n╰━━━━━━━', fail: '╭─❏ 💦 「 *LEVEL CARD FAILED* 」\n┊ Mouu, failed to make the level card: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.levelcard', expect: /level/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const name = profile.name || ctx.pushName || ctx.senderDigits
  const xp = profile.xp ?? 0
  const level = levelFromXp(xp)
  try {
    const buffer = await levelCard({
      name,
      level,
      xp,
      xpNow: xpForLevel(level),
      xpNext: xpForLevel(level + 1),
    })
    return sendImage(ctx, buffer, { caption: ctx.t('levelcard.caption', { name, level }) })
  } catch (err) {
    return ctx.reply(ctx.t('levelcard.fail', { error: err.message }))
  }
}
