export const config = {
  name: "upsw",
  alias: [],
  category: "group",
  description: { id: "Upload story untuk grup (border hijau)", en: "KANA version of the Elaina-MD upsw feature, rewritten in KANA style" },
  usage: ".upsw <teks>",
  example: ".upsw Halo semua",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    "upsw": {
      body: "╭─❏ 👥 「 *UPSW* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 👥 「 *UPSW* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "upsw": {
      body: "╭─❏ 👥 「 *UPSW* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 👥 「 *UPSW* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.upsw Halo semua apa kabar', expect: /Story grup terkirim/ }
// Upload story grup: pesan yang sama dibungkus groupStatus (README library,
// bagian Status Grup), jadi tampil sebagai story di grup ini. Teks memakai
// latar hijau khas WhatsApp; gambar/video yang dikutip jadi story media.
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('upsw.body', { text }))
  const arg = (ctx.text || '').trim()
  try {
    const qmsg = ctx.quoted?.message
    const kind = qmsg?.imageMessage ? 'image' : qmsg?.videoMessage ? 'video' : null
    if (kind) {
      let buf = null
      try { buf = await ctx.downloadQuoted() } catch { buf = null }
      if (!buf?.length) return say('Medianya gagal diunduh, coba kirim ulang yaa~')
      const content = kind === 'image'
        ? { image: buf, caption: arg || undefined, groupStatus: true }
        : { video: buf, caption: arg || undefined, groupStatus: true }
      await ctx.sock.sendMessage(ctx.chat, content)
      return say('Story grup terkirim dari media itu~')
    }
    if (!arg) return say('Tulis teks story-nya yaa, contoh: .upsw Halo semua, atau balas gambar/video dengan .upsw')
    await ctx.sock.sendMessage(ctx.chat, { text: arg, groupStatus: true }, { backgroundColor: '#25D366', textColor: '#ffffff' })
    return say('Story grup terkirim dengan latar hijau~')
  } catch (err) {
    return ctx.reply(ctx.t('upsw.fail', { error: err.message }))
  }
}
