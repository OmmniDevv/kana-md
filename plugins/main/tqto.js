export const config = {
  name: 'tqto',
  alias: [],
  category: 'main',
  description: { id: 'Ucapan terima kasih KANA untuk pihak pihak yang berjasa', en: 'KANA thanks to the people and projects that made it possible' },
  usage: '.tqto',
  example: '.tqto',
  cooldown: 5,
}

export const i18n = {
  id: {
    tqto: {
      body: '╭─❏ 💌 「 *THANKS TO* 」\n┊ Makasih sebesar besarnya buat:\n┊ 👑 *OmniDev*, owner sekaligus pembuat KANA, yang nggak pernah capek ngetes dan benerin KANA.\n┊ 🔌 *rexxhayanasi*, pembuat library elaina-baileys yang jadi tulang punggung KANA.\n┊ 📚 *Elaina-MD*, script referensi milik owner yang jadi bahan belajar utama KANA.\n┊ 🎮 *himanackerman* (RYO-YAMADA-MD), referensi format game HTML yang akhirnya tampil di HP pengguna.\n┊ 🧪 Para penguji, termasuk *Yudhazz*, yang rela grup dan chatnya jadi tempat uji fitur.\n┊ 💖 Dan semua pengguna KANA yang setia memakai dan melaporkan bug~\n╰━━━━━━━',
    },
  },
  en: {
    tqto: {
      body: '╭─❏ 💌 「 *THANKS TO* 」\n┊ Huge thanks to:\n┊ 👑 *OmniDev*, the owner and creator of KANA, who never gets tired of testing and fixing KANA.\n┊ 🔌 *rexxhayanasi*, author of the elaina-baileys library that powers KANA.\n┊ 📚 *Elaina-MD*, the owner own reference script that KANA learned the most from.\n┊ 🎮 *himanackerman* (RYO-YAMADA-MD), the HTML game format reference that finally rendered on user phones.\n┊ 🧪 The testers, including *Yudhazz*, who lent their groups and chats as feature test beds.\n┊ 💖 And every KANA user who keeps using it and reporting bugs~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tqto', expect: /thanks|makasih/i }

export async function handler(ctx) {
  return ctx.reply(ctx.t('tqto.body'))
}
