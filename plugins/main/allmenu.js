
export const config = {
  name: "allmenu",
  alias: ["fullmenu", "am", "semua"],
  category: "main",
  description: { id: "Fitur allmenu versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD allmenu feature, rewritten in KANA style" },
  usage: ".allmenu",
  example: ".allmenu",
  cooldown: 5,
}

export const i18n = {
  id: {
    "allmenu": {
      body: "╭─❏ 📄 「 *ALLMENU* 」\n┊ Fitur allmenu versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "allmenu",
    },
  },
  en: {
    "allmenu": {
      body: "╭─❏ 📄 「 *ALLMENU* 」\n┊ The allmenu feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "allmenu",
    },
  },
}

export const test = { input: '.allmenu', expect: /allmenu|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('allmenu.body'))
}
