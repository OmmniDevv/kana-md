import { buildPinPayload } from '../../src/services/pin-message.js'

export const config = {
  name: 'unpinpesan',
  alias: ['unpinmsg'],
  category: 'group',
  description: { id: 'Lepas sematan pesan yang dikutip di grup', en: 'Unpin the quoted message in the group' },
  usage: '.unpinpesan',
  example: '.unpinpesan',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    unpinpesan: {
      needQuote: '╭─❏ 📌 「 *KUTIP PESANNYA* 」\n┊ Balas pesan yang mau dilepas sematannya pakai *.unpinpesan* yaa~\n╰━━━━━━━',
      done: '╭─❏ 📌 「 *SEMATAN DILEPAS* 」\n┊ Sematan pesannya udah KANA lepas~\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL MELEPAS SEMATAN* 」\n┊ {error}\n┊ Pastikan KANA admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    unpinpesan: {
      needQuote: '╭─❏ 📌 「 *QUOTE THE MESSAGE* 」\n┊ Reply to the message you want to unpin with *.unpinpesan*~\n╰━━━━━━━',
      done: '╭─❏ 📌 「 *MESSAGE UNPINNED* 」\n┊ The message is unpinned~\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *FAILED TO UNPIN* 」\n┊ {error}\n┊ Make sure KANA is a group admin~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.unpinpesan', expect: /kutip|quote/i }

export async function handler(ctx) {
  const payload = buildPinPayload(ctx.quoted, ctx.chat, { isGroup: ctx.isGroup, botJid: ctx.botJid, unpin: true })
  if (!payload) return ctx.reply(ctx.t('unpinpesan.needQuote'))
  try {
    await ctx.sock.sendMessage(ctx.chat, payload)
  } catch (err) {
    return ctx.reply(ctx.t('unpinpesan.fail', { error: err.message }))
  }
  return ctx.reply(ctx.t('unpinpesan.done'))
}
