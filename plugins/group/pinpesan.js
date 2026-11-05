import { buildPinPayload } from '../../src/services/pin-message.js'

export const config = {
  name: 'pinpesan',
  alias: ['pinmsg'],
  category: 'group',
  description: { id: 'Sematkan pesan yang dikutip di grup', en: 'Pin the quoted message in the group' },
  usage: '.pinpesan',
  example: '.pinpesan',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    pinpesan: {
      needQuote: '╭─❏ 📌 「 *KUTIP PESANNYA* 」\n┊ Balas pesan yang mau disematkan pakai *.pinpesan* yaa~\n╰━━━━━━━',
      done: '╭─❏ 📌 「 *PESAN DISEMATKAN* 」\n┊ Pesannya udah KANA sematkan~\n┊ Lepas lagi pakai *.unpinpesan* yaa~\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL MENYEMATKAN* 」\n┊ {error}\n┊ Pastikan KANA admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    pinpesan: {
      needQuote: '╭─❏ 📌 「 *QUOTE THE MESSAGE* 」\n┊ Reply to the message you want to pin with *.pinpesan*~\n╰━━━━━━━',
      done: '╭─❏ 📌 「 *MESSAGE PINNED* 」\n┊ The message is pinned~\n┊ Unpin it again with *.unpinpesan*~\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *FAILED TO PIN* 」\n┊ {error}\n┊ Make sure KANA is a group admin~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pinpesan', expect: /kutip|quote/i }

export async function handler(ctx) {
  const payload = buildPinPayload(ctx.quoted, ctx.chat, { isGroup: ctx.isGroup, botJid: ctx.botJid })
  if (!payload) return ctx.reply(ctx.t('pinpesan.needQuote'))
  try {
    await ctx.sock.sendMessage(ctx.chat, payload)
  } catch (err) {
    return ctx.reply(ctx.t('pinpesan.fail', { error: err.message }))
  }
  return ctx.reply(ctx.t('pinpesan.done'))
}
