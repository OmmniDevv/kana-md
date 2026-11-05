import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'logometal',
  alias: [],
  category: 'maker',
  description: { id: 'Logo teks metal perak tegas dari teks kamu', en: 'Bold silver metal text logo from your text' },
  usage: '.logometal <teks>',
  example: '.logometal OMNIDEVV',
  cooldown: 5,
}

export const i18n = {
  id: { logometal: { hint: '╭─❏ ✏️ 「 *BUTUH TEKS LOGO* 」\n┊ Tulis teks logonya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.logometal OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *LOGO METAL JADI* 」\n┊ Logo metal *{text}* jadii~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN LOGO* 」\n┊ Mouu, gagal bikin logo: *{error}*~\n╰━━━━━━━' } },
  en: { logometal: { hint: '╭─❏ ✏️ 「 *LOGO TEXT NEEDED* 」\n┊ Write the logo text please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.logometal OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *METAL LOGO READY* 」\n┊ Metal logo *{text}* is ready~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *LOGO FAILED* 」\n┊ Mouu, failed to make the logo: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.logometal KANA', expect: /.+/ }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 30)
  if (!text) return ctx.reply(ctx.t('logometal.hint'))
  try {
    const buffer = await textImage({
      width: 1024, height: 512, background: '0x111318',
      lines: [
        { text, size: 84, color: 'e5e7eb', bold: true, y: 190 },
        { text: '▪ HEAVY METAL ▪', size: 30, color: '9ca3af', y: 320 },
      ],
    })
    return sendImage(ctx, buffer, { caption: ctx.t('logometal.caption', { text, mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('logometal.fail', { error: err.message }))
  }
}
