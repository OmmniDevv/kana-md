
export const config = {
  name: "enable",
  alias: [],
  category: "main",
  description: { id: "Fitur enable versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD enable feature, rewritten in KANA style" },
  usage: ".enable",
  example: ".enable",
  cooldown: 5,
}

export const i18n = {
  id: {
    "enable": {
      body: "╭─❏ 📄 「 *ENABLE* 」\n┊ Fitur enable versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "enable",
    },
  },
  en: {
    "enable": {
      body: "╭─❏ 📄 「 *ENABLE* 」\n┊ The enable feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "enable",
    },
  },
}

export const test = { input: '.enable', expect: /enable|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('enable.body'))
}
