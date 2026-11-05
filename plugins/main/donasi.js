
export const config = {
  name: "donasi",
  alias: [],
  category: "main",
  description: { id: "Fitur donasi versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD donasi feature, rewritten in KANA style" },
  usage: ".donasi",
  example: ".donasi",
  cooldown: 5,
}

export const i18n = {
  id: {
    "donasi": {
      body: "╭─❏ 📄 「 *DONASI* 」\n┊ Fitur donasi versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "donasi",
    },
  },
  en: {
    "donasi": {
      body: "╭─❏ 📄 「 *DONASI* 」\n┊ The donasi feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "donasi",
    },
  },
}

export const test = { input: '.donasi', expect: /donasi|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('donasi.body'))
}
