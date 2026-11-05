
export const config = {
  name: "stats",
  alias: [],
  category: "main",
  description: { id: "Fitur stats versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD stats feature, rewritten in KANA style" },
  usage: ".stats",
  example: ".stats",
  cooldown: 5,
}

export const i18n = {
  id: {
    "stats": {
      body: "╭─❏ 📄 「 *STATS* 」\n┊ Fitur stats versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "stats",
    },
  },
  en: {
    "stats": {
      body: "╭─❏ 📄 「 *STATS* 」\n┊ The stats feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "stats",
    },
  },
}

export const test = { input: '.stats', expect: /stats|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('stats.body'))
}
