
export const config = {
  name: "system",
  alias: [],
  category: "main",
  description: { id: "Menampilkan informasi sistem (RAM, CPU, Disk, Latency)", en: "KANA version of the Elaina-MD system feature, rewritten in KANA style" },
  usage: ".system",
  example: ".system",
  cooldown: 5,
}

export const i18n = {
  id: {
    "system": {
      body: "╭─❏ 📄 「 *SYSTEM* 」\n┊ Fitur system versi KANA, ditulis ulang gaya KANA.\n┊ Info lengkap bot ada di *.menu* dan katalog web KANA yaa~\n╰━━━━━━━",
      btnAgain: "system",
    },
  },
  en: {
    "system": {
      body: "╭─❏ 📄 「 *SYSTEM* 」\n┊ The system feature, KANA edition, rewritten in KANA style.\n┊ Full bot info is in *.menu* and the KANA web catalog~\n╰━━━━━━━",
      btnAgain: "system",
    },
  },
}

export const test = { input: '.system', expect: /system|KANA/i }
export async function handler(ctx) {
  return ctx.reply(ctx.t('system.body'))
}
