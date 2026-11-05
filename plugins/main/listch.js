
export const config = {
  name: "listch",
  alias: [],
  category: "main",
  description: { id: "Fitur listch versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD listch feature, rewritten in KANA style" },
  usage: ".listch",
  example: ".listch",
  cooldown: 5,
}

export const i18n = {
  id: {
    "listch": {
      body: "╭─❏ 📄 「 *LISTCH* 」\n┊ Fitur listch versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "listch",
    },
  },
  en: {
    "listch": {
      body: "╭─❏ 📄 「 *LISTCH* 」\n┊ The listch feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "listch",
    },
  },
}

export const test = { input: '.listch', expect: /listch|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('listch.body'))
}
