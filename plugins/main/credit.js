export const config = {
  name: 'credit',
  alias: [],
  category: 'main',
  description: { id: 'Menampilkan kredit pembuat dan proyek di balik KANA', en: 'Show the credits of the maker and projects behind KANA' },
  usage: '.credit',
  example: '.credit',
  cooldown: 5,
}

export const i18n = {
  id: {
    credit: {
      body: '╭─❏ 📜 「 *CREDIT KANA* 」\n┊ 🤖 *KANA* dibuat dan dimiliki oleh *OmniDev* (GitHub: OmmniDevv).\n┊ 🔌 Library WhatsApp: *@rexxhayanasi/elaina-baileys* oleh *rexxhayanasi*.\n┊ 📚 Referensi perilaku dan menu: *Elaina-MD* (script milik owner sendiri).\n┊ 🎮 Referensi format game HTML: *RYO-YAMADA-MD* oleh *himanackerman*.\n┊ 🌐 Dashboard: kana.omnicorp.web.id\n┊ KANA ditulis ulang dengan gaya sendiri; tidak ada kode yang disalin mentah dari referensi.\n╰━━━━━━━',
    },
  },
  en: {
    credit: {
      body: '╭─❏ 📜 「 *KANA CREDITS* 」\n┊ 🤖 *KANA* is created and owned by *OmniDev* (GitHub: OmmniDevv).\n┊ 🔌 WhatsApp library: *@rexxhayanasi/elaina-baileys* by *rexxhayanasi*.\n┊ 📚 Behavior and menu reference: *Elaina-MD* (the owner own script).\n┊ 🎮 HTML game format reference: *RYO-YAMADA-MD* by *himanackerman*.\n┊ 🌐 Dashboard: kana.omnicorp.web.id\n┊ KANA is rewritten in its own style; no code is copied raw from the references.\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.credit', expect: /credit|kredit/i }

export async function handler(ctx) {
  return ctx.reply(ctx.t('credit.body'))
}
