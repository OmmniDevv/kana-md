export const config = {
  name: 'del',
  alias: ['hapuspesan', 'delete'],
  category: 'group',
  description: { id: 'Hapus pesan: balas pesan yang mau dihapus dengan perintah ini (admin grup)', en: 'Delete a message: reply to the message to delete with this command (group admin)' },
  usage: 'Balas pesan dengan .del',
  example: '.del',
  cooldown: 2,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    del: {
      needQuote: '╭─❏ 🗑️ 「 *BALAS PESANNYA DULU* 」\n┊ Balas (reply) pesan yang mau dihapus dengan *.del* yaa~\n╰━━━━━━━ {mood}',
      done: '╭─❏ 🗑️ 「 *PESAN DIHAPUS* 」\n┊ Pesan sudah KANA hapus~\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL HAPUS PESAN* 」\n┊ {error}\n┊ KANA harus jadi admin grup buat hapus pesan orang lain yaa~\n╰━━━━━━━',
    },
  },
  en: {
    del: {
      needQuote: '╭─❏ 🗑️ 「 *REPLY TO THE MESSAGE FIRST* 」\n┊ Reply to the message you want deleted with *.del*~\n╰━━━━━━━ {mood}',
      done: '╭─❏ 🗑️ 「 *MESSAGE DELETED* 」\n┊ The message has been deleted~\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *FAILED TO DELETE* 」\n┊ {error}\n┊ KANA must be a group admin to delete other people messages~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.del', expect: /reply|balas/i }

export async function handler(ctx) {
  const quoted = ctx.quoted
  if (!quoted?.stanzaId) return ctx.reply(ctx.t('del.needQuote', { mood: ctx.say('mikir') }))
  const key = {
    remoteJid: ctx.chat,
    id: quoted.stanzaId,
    participant: quoted.sender || undefined,
  }
  try {
    await ctx.sock.sendMessage(ctx.chat, { delete: key })
    await ctx.sock.sendMessage(ctx.chat, { delete: ctx.raw.key }).catch(() => {})
    return ctx.reply(ctx.t('del.done'))
  } catch (err) {
    return ctx.reply(ctx.t('del.fail', { error: err.message }))
  }
}
