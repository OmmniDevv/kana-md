export const CHANNEL_LINK_KEY = 'channel_link'

export const config = {
  name: 'saluran',
  alias: [],
  category: 'main',
  description: { id: 'Tampilkan link saluran (channel) resmi bot; owner mengatur linknya lewat .saluran set <link>', en: 'Show the official bot channel link; the owner sets it via .saluran set <link>' },
  usage: '.saluran',
  example: '.saluran',
  cooldown: 5,
}

export const i18n = {
  id: {
    saluran: {
      body: '╭─❏ 📣 「 *SALURAN RESMI BOT* 」\n┊ Ikuti saluran resmi KANA buat info update dan pengumuman terbaru yaa~\n┊ {link}\n╰━━━━━━━',
      unset: '╭─❏ 📣 「 *SALURAN RESMI BOT* 」\n┊ Link saluran resmi belum diatur owner~\n┊ Buat owner: *.saluran set <link whatsapp.com/channel>*\n╰━━━━━━━',
      saved: '╭─❏ ✅ 「 *LINK SALURAN DISIMPAN* 」\n┊ Siap~ link saluran resmi sekarang: {link}\n╰━━━━━━━',
      ownerOnly: '╭─❏ 👑 「 *KHUSUS OWNER* 」\n┊ Mengatur link saluran resmi cuma bisa dilakukan owner bot~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *LINK TIDAK VALID* 」\n┊ Link saluran harus berbentuk *https://whatsapp.com/channel/<kode>* yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    saluran: {
      body: '╭─❏ 📣 「 *OFFICIAL BOT CHANNEL* 」\n┊ Follow the official KANA channel for the latest updates and announcements~\n┊ {link}\n╰━━━━━━━',
      unset: '╭─❏ 📣 「 *OFFICIAL BOT CHANNEL* 」\n┊ The official channel link is not set by the owner yet~\n┊ For the owner: *.saluran set <whatsapp.com/channel link>*\n╰━━━━━━━',
      saved: '╭─❏ ✅ 「 *CHANNEL LINK SAVED* 」\n┊ Done~ the official channel link is now: {link}\n╰━━━━━━━',
      ownerOnly: '╭─❏ 👑 「 *OWNER ONLY* 」\n┊ Setting the official channel link is only for the bot owner~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *INVALID LINK* 」\n┊ The channel link must look like *https://whatsapp.com/channel/<code>*~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.saluran', expect: /saluran|channel/i }

export async function handler(ctx) {
  const sub = (ctx.args?.[0] || '').toLowerCase()
  try {
    if (sub === 'set') {
      if (!ctx.isOwner) return ctx.reply(ctx.t('saluran.ownerOnly'))
      const link = (ctx.args?.[1] || '').trim()
      if (!/^https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9_-]+$/.test(link)) {
        return ctx.reply(ctx.t('saluran.invalid'))
      }
      await ctx.storage.set('kv', CHANNEL_LINK_KEY, link)
      return ctx.reply(ctx.t('saluran.saved', { link }))
    }
    const link = await ctx.storage.get('kv', CHANNEL_LINK_KEY)
    if (!link) return ctx.reply(ctx.t('saluran.unset'))
    return ctx.reply(ctx.t('saluran.body', { link }))
  } catch (err) {
    return ctx.reply(ctx.t('saluran.fail', { error: err.message }))
  }
}
