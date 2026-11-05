export const config = {
  name: 'totag',
  alias: [],
  category: 'group',
  description: { id: 'Tag semua member grup dengan teks argumen, atau dengan pesan yang dibalas (reply)', en: 'Tag all group members with the argument text, or with the replied message' },
  usage: '.totag <teks> atau balas pesan dengan .totag',
  example: '.totag Halo semua, rapat jam 7 ya',
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    totag: {
      usage: '╭─❏ 📣 「 *TOTAG* 」\n┊ Kasih teksnya yaa: *.totag <teks>*\n┊ Atau balas pesan apa pun dengan *.totag*, teks pesan itu yang KANA teruskan ke semua member~\n╰━━━━━━━',
    },
  },
  en: {
    totag: {
      usage: '╭─❏ 📣 「 *TOTAG* 」\n┊ Give me the text: *.totag <text>*\n┊ Or reply to any message with *.totag*, and that message text is forwarded to all members~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.totag Halo semua, rapat jam 7 ya', expect: /rapat jam 7/ }

function quotedTextOf(quoted) {
  const m = quoted?.message ?? {}
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    ''
  ).trim()
}

// Tag semua member memakai mentions penuh (terlihat sebagai tag, beda
// dari .tagall yang menampilkan daftar nama dan .hidetag yang
// menyembunyikan tag). Sumber teks: argumen perintah, atau isi pesan
// yang dibalas sesuai deskripsi perintah ini.
export async function handler(ctx) {
  const meta = await ctx.sock.groupMetadata(ctx.chat)
  const mentions = (meta.participants ?? []).map((p) => p.id)
  const text = (ctx.text || '').trim() || quotedTextOf(ctx.quoted)
  if (!text) return ctx.reply(ctx.t('totag.usage'))
  return ctx.sock.sendMessage(ctx.chat, { text, mentions }, { quoted: ctx.raw })
}
