export const GB_LINK_KEY = 'gbbot_link'

export const config = {
  name: 'gbbot',
  alias: [],
  category: 'main',
  description: { id: 'Tampilkan link grup resmi bot; owner mengatur linknya lewat .gbbot set <link>', en: 'Show the official bot group link; the owner sets it via .gbbot set <link>' },
  usage: '.gbbot',
  example: '.gbbot',
  cooldown: 5,
}

export const i18n = {
  id: {
    gbbot: {
      body: '╭─❏ 👥 「 *GRUP RESMI BOT* 」\n┊ Gabung grup resmi KANA di sini yaa~\n┊ {link}\n┊ Di sana ada info update, pengumuman, dan tempat ngobrol sesama pengguna KANA~\n╰━━━━━━━',
      unset: '╭─❏ 👥 「 *GRUP RESMI BOT* 」\n┊ Link grup resmi belum diatur owner~\n┊ Buat owner: *.gbbot set <link chat.whatsapp.com>*\n╰━━━━━━━',
      saved: '╭─❏ ✅ 「 *LINK GRUP DISIMPAN* 」\n┊ Siap~ link grup resmi sekarang: {link}\n╰━━━━━━━',
      ownerOnly: '╭─❏ 👑 「 *KHUSUS OWNER* 」\n┊ Mengatur link grup resmi cuma bisa dilakukan owner bot~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *LINK TIDAK VALID* 」\n┊ Link grup harus berbentuk *https://chat.whatsapp.com/<kode>* yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    gbbot: {
      body: '╭─❏ 👥 「 *OFFICIAL BOT GROUP* 」\n┊ Join the official KANA group here~\n┊ {link}\n┊ That is where updates, announcements, and fellow KANA users hang out~\n╰━━━━━━━',
      unset: '╭─❏ 👥 「 *OFFICIAL BOT GROUP* 」\n┊ The official group link is not set by the owner yet~\n┊ For the owner: *.gbbot set <chat.whatsapp.com link>*\n╰━━━━━━━',
      saved: '╭─❏ ✅ 「 *GROUP LINK SAVED* 」\n┊ Done~ the official group link is now: {link}\n╰━━━━━━━',
      ownerOnly: '╭─❏ 👑 「 *OWNER ONLY* 」\n┊ Setting the official group link is only for the bot owner~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *INVALID LINK* 」\n┊ The group link must look like *https://chat.whatsapp.com/<code>*~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.gbbot', expect: /grup|group/i }

export async function handler(ctx) {
  const sub = (ctx.args?.[0] || '').toLowerCase()
  try {
    if (sub === 'set') {
      if (!ctx.isOwner) return ctx.reply(ctx.t('gbbot.ownerOnly'))
      const link = (ctx.args?.[1] || '').trim()
      if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+$/.test(link)) {
        return ctx.reply(ctx.t('gbbot.invalid'))
      }
      await ctx.storage.set('kv', GB_LINK_KEY, link)
      return ctx.reply(ctx.t('gbbot.saved', { link }))
    }
    const link = await ctx.storage.get('kv', GB_LINK_KEY)
    if (!link) return ctx.reply(ctx.t('gbbot.unset'))
    return ctx.reply(ctx.t('gbbot.body', { link }))
  } catch (err) {
    return ctx.reply(ctx.t('gbbot.fail', { error: err.message }))
  }
}
