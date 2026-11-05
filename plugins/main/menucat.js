
export const config = {
  name: "menucat",
  alias: ["mc", "category", "mcat"],
  category: "main",
  description: { id: "Fitur menucat versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD menucat feature, rewritten in KANA style" },
  usage: ".menucat",
  example: ".menucat",
  cooldown: 5,
}

export const i18n = {
  id: {
    "menucat": {
      body: "╭─❏ 📄 「 *MENUCAT* 」\n┊ Fitur menucat versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "menucat",
    },
  },
  en: {
    "menucat": {
      body: "╭─❏ 📄 「 *MENUCAT* 」\n┊ The menucat feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "menucat",
    },
  },
}

export const test = { input: '.menucat', expect: /menucat|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('menucat.body'))
}
