
export const config = {
  name: "tqto",
  alias: [],
  category: "main",
  description: { id: "Fitur tqto versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD tqto feature, rewritten in KANA style" },
  usage: ".tqto",
  example: ".tqto",
  cooldown: 5,
}

export const i18n = {
  id: {
    "tqto": {
      body: "╭─❏ 📄 「 *TQTO* 」\n┊ Fitur tqto versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "tqto",
    },
  },
  en: {
    "tqto": {
      body: "╭─❏ 📄 「 *TQTO* 」\n┊ The tqto feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "tqto",
    },
  },
}

export const test = { input: '.tqto', expect: /tqto|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('tqto.body'))
}
