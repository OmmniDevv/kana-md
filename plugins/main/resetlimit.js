
export const config = {
  name: "resetlimit",
  alias: [],
  category: "main",
  description: { id: "Fitur resetlimit versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD resetlimit feature, rewritten in KANA style" },
  usage: ".resetlimit",
  example: ".resetlimit",
  cooldown: 5,
}

export const i18n = {
  id: {
    "resetlimit": {
      body: "╭─❏ 📄 「 *RESETLIMIT* 」\n┊ Fitur resetlimit versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "resetlimit",
    },
  },
  en: {
    "resetlimit": {
      body: "╭─❏ 📄 「 *RESETLIMIT* 」\n┊ The resetlimit feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "resetlimit",
    },
  },
}

export const test = { input: '.resetlimit', expect: /resetlimit|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('resetlimit.body'))
}
