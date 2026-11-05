
export const config = {
  name: "saluran",
  alias: [],
  category: "main",
  description: { id: "Join saluran resmi Rimuru 😈", en: "KANA version of the Elaina-MD saluran feature, rewritten in KANA style" },
  usage: ".saluran",
  example: ".saluran",
  cooldown: 5,
}

export const i18n = {
  id: {
    "saluran": {
      body: "╭─❏ 📄 「 *SALURAN* 」\n┊ Fitur saluran versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "saluran",
    },
  },
  en: {
    "saluran": {
      body: "╭─❏ 📄 「 *SALURAN* 」\n┊ The saluran feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "saluran",
    },
  },
}

export const test = { input: '.saluran', expect: /saluran|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('saluran.body'))
}
