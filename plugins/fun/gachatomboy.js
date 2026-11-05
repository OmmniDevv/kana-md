import { sendButtons } from '../../src/ui/buttons.js'

// Gachatomboy: gacha karakter tomboy acak, pola sama seperti gachabini
// dan padanan Elaina-MD. Satu tarikan memilih satu karakter dari daftar
// nama, love meter 0-100 acak, status hubungan acak, dan satu dari
// tiga templat balasan. Murni Math.random.
export const config = {
  name: 'gachatomboy',
  alias: [],
  category: 'fun',
  description: { id: 'Gacha karakter tomboy acak plus love meter dan status', en: 'Random tomboy character gacha plus love meter and status' },
  usage: '.gachatomboy',
  example: '.gachatomboy',
  cooldown: 5,
}

// Daftar karakter tomboy: 30 nama dari padanan Elaina-MD ditambah
// karakter tomboy anime lain sampai 80 nama.
export const TOMBOY_LIST = [
  'Misaki Ayuzawa', 'Haruhi Fujioka', 'Ruka Sarashina', 'Hikari Hanazono', 'Ushio',
  'Makoto Kino', 'Souta', 'Yuki Nagato', 'Shikimori', 'Uzaki Hana',
  'Tsuki Uzaki', 'Nagatoro', 'Chika Fujiwara', 'Ai Hayasaka', 'Akane Kurokawa',
  'Ruby Hoshino', 'Frieren', 'Akira Asai', 'Tomoko Kuroki', 'Menma',
  "Izumi's Mom", 'Yukino Yukinoshita', 'Rikka Takarada', 'Chisato Nishikigi', 'Takina Inoue',
  'Vivy', 'Shiraori', 'Anisphia Wynn Palletia', 'Euphyllia Magenta', 'Naoto Shirogane',
  'Chie Satonaka', 'Makoto Niijima', 'Mikasa Ackerman', 'Annie Leonhart', 'Ymir',
  'Hange Zoe', 'Sasha Blouse', 'Rukia Kuchiki', 'Yoruichi Shihouin', 'Tatsuki Arisawa',
  'Soifon', 'Maki Zenin', 'Nobara Kugisaki', 'Yuki Tsukumo', 'Kallen Stadtfeld',
  'Revy', 'Balalaika', 'Motoko Kusanagi', 'Faye Valentine', 'Edward Wong',
  'Winry Rockbell', 'Riza Hawkeye', 'Olivier Armstrong', 'Lan Fan', 'Casca',
  'Seras Victoria', 'Integra Hellsing', 'Ryuko Matoi', 'Mako Mankanshoku', 'Satsuki Kiryuin',
  'Haruko Haruhara', 'Mamimi Samejima', 'Asuka Langley', 'Misato Katsuragi', 'Ritsuko Akagi',
  'Bulma', 'Android 18', 'Videl', 'Caulifla', 'Kale',
  'Nami', 'Boa Hancock', 'Nico Robin', 'Yamato', 'Jewelry Bonney',
  'Erza Scarlet', 'Mirajane Strauss', 'Levy McGarden', 'Bisca Connell', 'Kagura Mikazuchi',
]

export const i18n = {
  id: {
    gachatomboy: {
      title: 'Gacha Tomboy',
      btnAgain: 'Gacha Lagi',
      statuses: [
        '💖 Cinta Sejati',
        '💘 Pasangan Serasi',
        '💕 Jodoh Anime',
        '💞 Relationship Goals',
        '💓 Bucin Maksimal',
        '💔 Hubungan Toxic',
      ],
      templates: [
        '╭─❏ 💍 「 *GACHA TOMBOY* 」\n┊ 👤 Suami: *{player}*\n┊ 👰 Tomboy: *{char}*\n┊ 💖 Love Meter: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Selamat atas pernikahan kalian, semoga langgeng yaa~\n╰━━━━━━━',
        '╭─❏ 👰 「 *TOMBOY FOUND* 」\n┊ 🎉 Selamat, *{player}* dapat tomboy baru!\n┊ ❤️ *{char}*\n┊ 💘 Kecocokan: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Jangan disia-siakan yaa~\n╰━━━━━━━',
        '╭─❏ 💞 「 *MATCHMAKING TOMBOY* 」\n┊ 👤 Player: *{player}*\n┊ 💖 Tomboy: *{char}*\n┊ 💓 Love Level: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Sistem telah menjodohkan kalian secara acak~\n╰━━━━━━━',
      ],
    },
  },
  en: {
    gachatomboy: {
      title: 'Tomboy Gacha',
      btnAgain: 'Roll Again',
      statuses: [
        '💖 True Love',
        '💘 Matching Couple',
        '💕 Anime Soulmates',
        '💞 Relationship Goals',
        '💓 Maximum Simp',
        '💔 Toxic Relationship',
      ],
      templates: [
        '╭─❏ 💍 「 *TOMBOY GACHA* 」\n┊ 👤 Husband: *{player}*\n┊ 👰 Tomboy: *{char}*\n┊ 💖 Love Meter: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Congrats on your marriage, may it last~\n╰━━━━━━━',
        '╭─❏ 👰 「 *TOMBOY FOUND* 」\n┊ 🎉 Congrats, *{player}* got a new tomboy!\n┊ ❤️ *{char}*\n┊ 💘 Compatibility: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Do not waste this chance~\n╰━━━━━━━',
        '╭─❏ 💞 「 *TOMBOY MATCHMAKING* 」\n┊ 👤 Player: *{player}*\n┊ 💖 Tomboy: *{char}*\n┊ 💓 Love Level: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ The system matched you two at random~\n╰━━━━━━━',
      ],
    },
  },
}

export const test = { input: '.gachatomboy', expect: /gacha tomboy|tomboy/i }

export function drawTomboy(rng = Math.random) {
  const pick = (arr) => arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))]
  return {
    char: pick(TOMBOY_LIST),
    love: Math.min(100, Math.floor(rng() * 101)),
    statusIndex: Math.min(5, Math.floor(rng() * 6)),
    templateIndex: Math.min(2, Math.floor(rng() * 3)),
  }
}

export function formatTomboy(pack, player, draw) {
  const vars = { player, char: draw.char, love: draw.love, status: pack.statuses[draw.statusIndex] }
  return pack.templates[draw.templateIndex].replace(/\{(\w+)\}/g, (m, key) => (vars[key] !== undefined ? String(vars[key]) : m))
}

export async function handler(ctx) {
  const pack = i18n[ctx.lang]?.gachatomboy ?? i18n.id.gachatomboy
  const draw = drawTomboy()
  const player = ctx.pushName || ctx.senderDigits
  const body = formatTomboy(pack, player, draw)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('gachatomboy.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('gachatomboy.btnAgain'), id: '.gachatomboy' }],
    textFallback: body,
  })
}
