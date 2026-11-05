
export const config = {
  name: "gbbot",
  alias: [],
  category: "main",
  description: { id: "Fitur gbbot versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD gbbot feature, rewritten in KANA style" },
  usage: ".gbbot",
  example: ".gbbot",
  cooldown: 5,
}

export const i18n = {
  id: {
    "gbbot": {
      body: "╭─❏ 📄 「 *GBBOT* 」\n┊ Fitur gbbot versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "gbbot",
    },
  },
  en: {
    "gbbot": {
      body: "╭─❏ 📄 「 *GBBOT* 」\n┊ The gbbot feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "gbbot",
    },
  },
}

export const test = { input: '.gbbot', expect: /gbbot|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('gbbot.body'))
}
