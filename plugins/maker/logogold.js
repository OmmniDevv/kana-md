import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'logogold',
  alias: [],
  category: 'maker',
  description: { id: 'Logo teks emas mewah dari teks kamu', en: 'Luxury gold text logo from your text' },
  usage: '.logogold <teks>',
  example: '.logogold OMNIDEVV',
  cooldown: 5,
}

export const i18n = {
  id: { logogold: { hint: '╭─❏ ✏️ 「 *BUTUH TEKS LOGO* 」\n┊ Tulis teks logonya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.logogold OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *LOGO EMAS JADI* 」\n┊ Logo emas *{text}* jadii~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN LOGO* 」\n┊ Mouu, gagal bikin logo: *{error}*~\n╰━━━━━━━' } },
  en: { logogold: { hint: '╭─❏ ✏️ 「 *LOGO TEXT NEEDED* 」\n┊ Write the logo text please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.logogold OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *GOLD LOGO READY* 」\n┊ Gold logo *{text}* is ready~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *LOGO FAILED* 」\n┊ Mouu, failed to make the logo: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.logogold KANA', expect: /.+/ }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 30)
  if (!text) return ctx.reply(ctx.t('logogold.hint'))
  try {
    const buffer = await textImage({
      width: 1024, height: 512, background: '0x1a1207',
      lines: [
        { text, size: 84, color: 'ffd700', bold: true, y: 190 },
        { text: '✦ LUXURY GOLD ✦', size: 30, color: 'd4af37', y: 320 },
      ],
    })
    return sendImage(ctx, buffer, { caption: ctx.t('logogold.caption', { text, mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('logogold.fail', { error: err.message }))
  }
}
