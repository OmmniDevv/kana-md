import { sendButtons } from '../../src/ui/buttons.js'

// Gachanasip: tarikan nasip acak seperti padanan Elaina-MD. Satu nasip
// dari daftar nasip khusus plus satu dari tiga bingkai tampilan,
// dipilih murni dengan Math.random.
export const config = {
  name: 'gachanasip',
  alias: [],
  category: 'fun',
  description: { id: 'Gacha nasip dan keberuntungan acak hari ini', en: 'Random fortune and luck gacha for today' },
  usage: '.gachanasip',
  example: '.gachanasip',
  cooldown: 5,
}

export const i18n = {
  id: {
    gachanasip: {
      title: 'Gacha Nasip',
      btnAgain: 'Tarik Lagi',
      nasips: [
        'Hari ini hoki banget, rezeki nyangkut di jalan 😎',
        'Sedikit sial, hati-hati dengan benda tajam ya',
        'Nasip biasa aja, tapi senyummu manis ❤️',
        'Rezeki datang tak terduga, siap-siap senyum 😏',
        'Hari ini banyak godaan, tapi kamu kuat 💪',
        'Nasip baik, kemungkinan dapat hadiah kecil 🎁',
        'Sedikit sial, jangan lupa bawa payung ☂️',
        'Nasip gokil! Ada orang jatuh cinta sama kamu hari ini 🥰',
        'Peruntungan naik, tapi jangan sombong ya 😉',
        'Nasip netral, santai aja dan nikmati hari 😎',
        'Ada kejutan kecil dari arah yang tidak kamu duga 🎉',
        'Hari ini cocok menyelesaikan urusan yang tertunda ✨',
      ],
      templates: [
        '╭─❏ 🍀 「 *GACHA NASIP* 」\n┊ 👤 Player: *{player}*\n┊ 🍀 Nasip: *{nasip}*\n┊\n┊ Semoga harimu menyenangkan yaa~\n╰━━━━━━━',
        '╭─❏ 🌟 「 *NASIP GACHA* 」\n┊ Yuk cek nasipmu, *{player}*!\n┊ 🌟 Nasip: *{nasip}*\n┊\n┊ Semoga hoki terus~\n╰━━━━━━━',
        '╭─❏ 💫 「 *NASIPMU* 」\n┊ 👤 Player: *{player}*\n┊ 🎲 Nasip: *{nasip}*\n┊\n┊ Semoga rezeki dan hoki selalu menyertaimu~\n╰━━━━━━━',
      ],
    },
  },
  en: {
    gachanasip: {
      title: 'Fortune Gacha',
      btnAgain: 'Draw Again',
      nasips: [
        'Super lucky today, fortune is stuck on your path 😎',
        'A bit unlucky, be careful with sharp objects',
        'Just an ordinary fortune, but your smile is sweet ❤️',
        'Unexpected fortune is coming, get ready to smile 😏',
        'Many temptations today, but you are strong 💪',
        'Good fortune, you might get a small gift 🎁',
        'A bit unlucky, do not forget an umbrella ☂️',
        'Wild fortune! Someone is falling for you today 🥰',
        'Your luck is rising, but do not get arrogant 😉',
        'Neutral fortune, just relax and enjoy the day 😎',
        'A small surprise is coming from an unexpected direction 🎉',
        'Today suits finishing things you have postponed ✨',
      ],
      templates: [
        '╭─❏ 🍀 「 *FORTUNE GACHA* 」\n┊ 👤 Player: *{player}*\n┊ 🍀 Fortune: *{nasip}*\n┊\n┊ May your day be a pleasant one~\n╰━━━━━━━',
        '╭─❏ 🌟 「 *FORTUNE DRAW* 」\n┊ Let us check your fortune, *{player}*!\n┊ 🌟 Fortune: *{nasip}*\n┊\n┊ May luck stay with you~\n╰━━━━━━━',
        '╭─❏ 💫 「 *YOUR FORTUNE* 」\n┊ 👤 Player: *{player}*\n┊ 🎲 Fortune: *{nasip}*\n┊\n┊ May fortune and luck always follow you~\n╰━━━━━━━',
      ],
    },
  },
}

export const test = { input: '.gachanasip', expect: /gacha nasip|fortune/i }

export function drawNasip(pack, rng = Math.random) {
  const pick = (arr) => arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))]
  return {
    nasip: pick(pack.nasips),
    templateIndex: Math.min(pack.templates.length - 1, Math.floor(rng() * pack.templates.length)),
  }
}

export function formatNasip(pack, player, draw) {
  const vars = { player, nasip: draw.nasip }
  return pack.templates[draw.templateIndex].replace(/\{(\w+)\}/g, (m, key) => (vars[key] !== undefined ? String(vars[key]) : m))
}

export async function handler(ctx) {
  const pack = i18n[ctx.lang]?.gachanasip ?? i18n.id.gachanasip
  const draw = drawNasip(pack)
  const player = ctx.pushName || ctx.senderDigits
  const body = formatNasip(pack, player, draw)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('gachanasip.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('gachanasip.btnAgain'), id: '.gachanasip' }],
    textFallback: body,
  })
}
