import { sendButtons } from '../../src/ui/buttons.js'

// Gachabini: gacha waifu acak seperti fitur Elaina-MD. Satu tarikan
// memilih satu waifu dari daftar karakter, love meter 0-100 acak,
// status hubungan acak, dan satu dari tiga templat balasan. Murni
// mekanik gacha, bukan lagi ramalan persen dari nama pemain.
export const config = {
  name: 'gachabini',
  alias: [],
  category: 'fun',
  description: { id: 'Gacha waifu acak: dapat istri anime plus love meter dan status', en: 'Random waifu gacha: get an anime wife plus love meter and status' },
  usage: '.gachabini',
  example: '.gachabini',
  cooldown: 5,
}

// Daftar waifu di-port dari daftar karakter gachabini Elaina-MD owner
// (182 nama).
export const WAIFU_LIST = [
  'Rimuru', 'Rem', 'Ram', 'Emilia', 'Satella', 'Echidna',
  'Beatrice', 'Priscilla', 'Crusch', 'Kurisu Makise', 'Mayuri Shiina', 'Suzuha Amane',
  'Mikasa Ackerman', 'Annie Leonhart', 'Historia Reiss', 'Sasha Blouse', 'Pieck Finger', 'Hinata Hyuga',
  'Sakura Haruno', 'Ino Yamanaka', 'Tsunade', 'Kushina Uzumaki', 'Asuna Yuuki', 'Sinon',
  'Leafa', 'Alice Zuberg', 'Rias Gremory', 'Akeno Himejima', 'Koneko Toujou', 'Asia Argento',
  'Xenovia', 'Yor Forger', 'Anya Forger', 'Fiona Frost', 'Mitsuri Kanroji', 'Shinobu Kocho',
  'Kanao Tsuyuri', 'Nezuko Kamado', 'Daki', 'Power', 'Makima', 'Himeno',
  'Kobeni', 'Reze', 'Kaguya Shinomiya', 'Chika Fujiwara', 'Ai Hayasaka', 'Miko Iino',
  'Ichika Nakano', 'Nino Nakano', 'Miku Nakano', 'Yotsuba Nakano', 'Itsuki Nakano', 'Mai Sakurajima',
  'Tomoe Koga', 'Rio Futaba', 'Lucy Heartfilia', 'Erza Scarlet', 'Juvia Lockser', 'Mirajane Strauss',
  'Taiga Aisaka', 'Minori Kushieda', 'Ami Kawashima', 'Marin Kitagawa', 'Sajuna Inui', 'Shinju Inui',
  'Shikimori', 'Izumi\'s Mom', 'Nagatoro', 'Gamo', 'Yoshi', 'Sakura Nagatoro',
  'Uzaki Hana', 'Tsuki Uzaki', 'Nazuna Nanakusa', 'Akira Asai', 'Frieren', 'Fern',
  'Serie', 'Ubel', 'Maomao', 'Gyokuyou', 'Ai Hoshino', 'Kana Arima',
  'Akane Kurokawa', 'Ruby Hoshino', 'Memcho', 'Raphtalia', 'Filo', 'Melty',
  'Roxy Migurdia', 'Sylphiette', 'Eris Boreas', 'Aqua', 'Darkness', 'Megumin',
  'Hestia', 'Ais Wallenstein', 'Holo', 'Tohru', 'Kanna Kamui', 'Lucoa',
  'Elma', 'Mikoto Misaka', 'Misaki Shokuhou', 'Kuroko Shirai', 'Yukino Yukinoshita', 'Yui Yuigahama',
  'Iroha Isshiki', 'Shizuka Hiratsuka', 'Rikka Takarada', 'Akane Shinjo', 'Rukia Kuchiki', 'Orihime Inoue',
  'Yoruichi', 'Boa Hancock', 'Nami', 'Robin', 'Vivi', 'Yamato',
  'Uta', 'Bulma', 'Android 18', 'Videl', 'Esdeath', 'Akame',
  'Chelsea', 'Mine', 'Leone', 'Shinoa Hiiragi', 'Krul Tepes', 'Illyasviel',
  'Saber', 'Rin Tohsaka', 'Sakura Matou', 'Yuno Gasai', 'Yuki Amano\'s Mom', 'Medusa Gorgon',
  'Albedo', 'Shalltear', 'Aura Bella Fiora', 'Delta', 'Alpha', 'Beta',
  'Gamma', 'Epsilon', 'Zeta', 'Chisato Nishikigi', 'Takina Inoue', 'Rebecca (Cyberpunk)',
  'Lucy (Cyberpunk)', 'Anju Emma', 'Lena (86)', 'Vladilena Milize', 'Vivy', 'Shiraori',
  'Anisphia Wynn Palletia', 'Euphyllia Magenta', 'Akari Watanabe', 'Alya', 'Yuki Suou', 'Aharen Reina',
  'Tomoko Kuroki', 'Menma', 'Haruhi Suzumiya', 'Misato Katsuragi', 'Asuka Langley', 'Rei Ayanami',
  'Matoi Ryuko', 'Satsuki Kiryuin', 'Akari Mizunashi', 'Chika Takami', 'Riko Sakurauchi', 'Honoka Kosaka',
  'Kotori Minami', 'Umi Sonoda', 'Nico Yazawa', 'Maki Nishikino', 'Eli Ayase', 'Hanayo Koizumi',
  'Nozomi Tojo', 'Rin Hoshizora',
]

export const i18n = {
  id: {
    gachabini: {
      title: 'Gacha Bini',
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
        '╭─❏ 💍 「 *GACHA BINI* 」\n┊ 👤 Suami: *{player}*\n┊ 👰 Istri: *{waifu}*\n┊ 💖 Love Meter: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Selamat atas pernikahan kalian, semoga langgeng yaa~\n╰━━━━━━━',
        '╭─❏ 👰 「 *WAIFU FOUND* 」\n┊ 🎉 Selamat, *{player}* dapat waifu baru!\n┊ ❤️ *{waifu}*\n┊ 💘 Kecocokan: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Jangan disia-siakan yaa~\n╰━━━━━━━',
        '╭─❏ 💞 「 *MATCHMAKING* 」\n┊ 👤 Player: *{player}*\n┊ 💖 Waifu: *{waifu}*\n┊ 💓 Love Level: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Sistem telah menjodohkan kalian secara acak~\n╰━━━━━━━',
      ],
    },
  },
  en: {
    gachabini: {
      title: 'Waifu Gacha',
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
        '╭─❏ 💍 「 *WAIFU GACHA* 」\n┊ 👤 Husband: *{player}*\n┊ 👰 Wife: *{waifu}*\n┊ 💖 Love Meter: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Congrats on your marriage, may it last~\n╰━━━━━━━',
        '╭─❏ 👰 「 *WAIFU FOUND* 」\n┊ 🎉 Congrats, *{player}* got a new waifu!\n┊ ❤️ *{waifu}*\n┊ 💘 Compatibility: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ Do not waste this chance~\n╰━━━━━━━',
        '╭─❏ 💞 「 *MATCHMAKING* 」\n┊ 👤 Player: *{player}*\n┊ 💖 Waifu: *{waifu}*\n┊ 💓 Love Level: *{love}%*\n┊ 📊 Status: *{status}*\n┊\n┊ The system matched you two at random~\n╰━━━━━━━',
      ],
    },
  },
}

export const test = { input: '.gachabini', expect: /gacha bini|waifu/i }

// Satu tarikan gacha. rng bisa disuntik buat tes.
export function drawGacha(rng = Math.random) {
  const pick = (arr) => arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))]
  return {
    waifu: pick(WAIFU_LIST),
    love: Math.min(100, Math.floor(rng() * 101)),
    statusIndex: Math.min(5, Math.floor(rng() * 6)),
    templateIndex: Math.min(2, Math.floor(rng() * 3)),
  }
}

export function formatGacha(t, pack, player, draw) {
  const template = pack.templates[draw.templateIndex]
  const vars = { player, waifu: draw.waifu, love: draw.love, status: pack.statuses[draw.statusIndex] }
  return template.replace(/\{(\w+)\}/g, (m, key) => (vars[key] !== undefined ? String(vars[key]) : m))
}

export async function handler(ctx) {
  const pack = i18n[ctx.lang]?.gachabini ?? i18n.id.gachabini
  const draw = drawGacha()
  const player = ctx.pushName || ctx.senderDigits
  const body = formatGacha(ctx.t, pack, player, draw)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('gachabini.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('gachabini.btnAgain'), id: '.gachabini' }],
    textFallback: body,
  })
}
