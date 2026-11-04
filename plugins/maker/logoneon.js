import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'logoneon',
  alias: [],
  category: 'maker',
  description: { id: 'Logo teks neon cyberpunk cyan dari teks kamu', en: 'Cyberpunk cyan neon text logo from your text' },
  usage: '.logoneon <teks>',
  example: '.logoneon OMNIDEVV',
  cooldown: 5,
}

export const i18n = {
  id: { logoneon: { hint: '╭─❏ ✏️ 「 *BUTUH TEKS LOGO* 」\n┊ Tulis teks logonya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.logoneon OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *LOGO NEON JADI* 」\n┊ Logo neon *{text}* jadii~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN LOGO* 」\n┊ Mouu, gagal bikin logo: *{error}*~\n╰━━━━━━━' } },
  en: { logoneon: { hint: '╭─❏ ✏️ 「 *LOGO TEXT NEEDED* 」\n┊ Write the logo text please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.logoneon OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *NEON LOGO READY* 」\n┊ Neon logo *{text}* is ready~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *LOGO FAILED* 」\n┊ Mouu, failed to make the logo: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.logoneon', expect: /logo/i }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 30)
  if (!text) return ctx.reply(ctx.t('logoneon.hint'))
  try {
    const buffer = await textImage({
      width: 1024, height: 512, background: '0x030b14',
      lines: [
        { text, size: 84, color: '22d3ee', bold: true, y: 190 },
        { text: '// CYBER NEON //', size: 30, color: '0891b2', y: 320, mono: true },
      ],
    })
    return sendImage(ctx, buffer, { caption: ctx.t('logoneon.caption', { text, mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('logoneon.fail', { error: err.message }))
  }
}
