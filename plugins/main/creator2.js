
export const config = {
  name: "creator2",
  alias: [],
  category: "main",
  description: { id: "Buka menu bot", en: "KANA version of the Elaina-MD creator2 feature, rewritten in KANA style" },
  usage: ".creator2",
  example: ".creator2",
  cooldown: 5,
}

export const i18n = {
  id: {
    "creator2": {
      body: "╭─❏ 📄 「 *CREATOR2* 」\n┊ Fitur creator2 versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "creator2",
    },
  },
  en: {
    "creator2": {
      body: "╭─❏ 📄 「 *CREATOR2* 」\n┊ The creator2 feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "creator2",
    },
  },
}

export const test = { input: '.creator2', expect: /creator2|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('creator2.body'))
}
