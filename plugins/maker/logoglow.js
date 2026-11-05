import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'logoglow',
  alias: [],
  category: 'maker',
  description: { id: 'Logo teks bercahaya neon ungu dari teks kamu', en: 'Glowing purple neon text logo from your text' },
  usage: '.logoglow <teks>',
  example: '.logoglow OMNIDEVV',
  cooldown: 5,
}

export const i18n = {
  id: { logoglow: { hint: '╭─❏ ✏️ 「 *BUTUH TEKS LOGO* 」\n┊ Tulis teks logonya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.logoglow OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *LOGO GLOW JADI* 」\n┊ Logo glow *{text}* jadii~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL BIKIN LOGO* 」\n┊ Mouu, gagal bikin logo: *{error}*~\n╰━━━━━━━' } },
  en: { logoglow: { hint: '╭─❏ ✏️ 「 *LOGO TEXT NEEDED* 」\n┊ Write the logo text please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.logoglow OMNIDEVV*\n╰━━━━━━━', caption: '╭─❏ ✨ 「 *GLOW LOGO READY* 」\n┊ Glow logo *{text}* is ready~ {mood}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *LOGO FAILED* 」\n┊ Mouu, failed to make the logo: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.logoglow KANA', expect: /.+/ }

export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 30)
  if (!text) return ctx.reply(ctx.t('logoglow.hint'))
  try {
    const buffer = await textImage({
      width: 1024, height: 512, background: '0x150826',
      lines: [
        { text, size: 84, color: 'e879f9', bold: true, y: 190 },
        { text: '✦ GLOW EDITION ✦', size: 30, color: 'a78bfa', y: 320 },
      ],
    })
    return sendImage(ctx, buffer, { caption: ctx.t('logoglow.caption', { text, mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('logoglow.fail', { error: err.message }))
  }
}
