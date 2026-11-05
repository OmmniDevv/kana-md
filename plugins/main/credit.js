
export const config = {
  name: "credit",
  alias: [],
  category: "main",
  description: { id: "Menampilkan credit Rimuru MD.", en: "KANA version of the Elaina-MD credit feature, rewritten in KANA style" },
  usage: ".credit",
  example: ".credit",
  cooldown: 5,
}

export const i18n = {
  id: {
    "credit": {
      body: "╭─❏ 📄 「 *CREDIT* 」\n┊ Fitur credit versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "credit",
    },
  },
  en: {
    "credit": {
      body: "╭─❏ 📄 「 *CREDIT* 」\n┊ The credit feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "credit",
    },
  },
}

export const test = { input: '.credit', expect: /credit|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('credit.body'))
}
