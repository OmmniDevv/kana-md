
export const config = {
  name: "usercard",
  alias: [],
  category: "main",
  description: { id: "Fitur usercard versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD usercard feature, rewritten in KANA style" },
  usage: ".usercard",
  example: ".usercard",
  cooldown: 5,
}

export const i18n = {
  id: {
    "usercard": {
      body: "╭─❏ 📄 「 *USERCARD* 」\n┊ Fitur usercard versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "usercard",
    },
  },
  en: {
    "usercard": {
      body: "╭─❏ 📄 「 *USERCARD* 」\n┊ The usercard feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "usercard",
    },
  },
}

export const test = { input: '.usercard', expect: /usercard|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('usercard.body'))
}
