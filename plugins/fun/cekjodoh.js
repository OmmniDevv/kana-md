import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekjodoh',
  alias: ['jodoh'],
  category: 'fun',
  description: { id: 'Cek kecocokan dua nama untuk hiburan, hasil selalu sama untuk pasangan yang sama', en: 'Check two names compatibility for fun, same pair always gives the same result' },
  usage: '.cekjodoh <nama1> & <nama2> atau mention dua orang',
  example: '.cekjodoh Budi & Sari',
  cooldown: 3,
}

// Hash deterministik (FNV-1a) dari gabungan dua nama yang sudah dinormalisasi
// dan diurutkan, jadi pasangan yang sama selalu dapat persen yang sama.
export function lovePercent(name1, name2) {
  const pair = [name1, name2]
    .map((n) => String(n ?? '').toLowerCase().trim().replace(/\s+/g, ' '))
    .sort()
    .join('💕')
  let hash = 2166136261
  for (let i = 0; i < pair.length; i++) {
    hash ^= pair.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) % 101
}

export function loveCategory(percent) {
  if (percent <= 20) return 'low'
  if (percent <= 40) return 'midlow'
  if (percent <= 60) return 'mid'
  if (percent <= 80) return 'high'
  return 'soulmate'
}

export const i18n = {
  id: {
    cekjodoh: {
      usage: 'Pakai: .cekjodoh <nama1> & <nama2>, contoh .cekjodoh Budi & Sari. Bisa juga mention dua orang yaa~',
      result: '💕 CEK JODOH 💕\n\n{name1} 💗 {name2}\nKecocokan: {percent}%\n\n{comment} {mood}\n\n{disclaimer}',
      low: 'Hmm, bintang-bintangnya lagi tidak sejalan nih. Tapi tenang, teman baik juga berharga banget~',
      midlow: 'Ada percikan kecil! Pelan-pelan saja, siapa tahu tumbuh~',
      mid: 'Lumayan serasi! Tinggal sering ngobrol biar makin nyambung~',
      high: 'Wah, cocok banget ini! Chemistry-nya kerasa sampai sini~',
      soulmate: 'Uwaaah, hampir sempurna! Ini sih kayak pasangan di drama favorit KANA~',
      disclaimer: 'Catatan: ini cuma permainan hiburan dari KANA, bukan ramalan beneran yaa. Jodoh itu urusan hati dan usaha, bukan persen dari bot~',
      againBtn: '💕 Cek Lagi',
      khodamBtn: '👻 Cek Khodam',
      footer: 'Cek-cek hiburan KANA',
    },
  },
  en: {
    cekjodoh: {
      usage: 'Use: .cekjodoh <name1> & <name2>, for example .cekjodoh Budi & Sari. You can also mention two people~',
      result: '💕 LOVE CHECK 💕\n\n{name1} 💗 {name2}\nCompatibility: {percent}%\n\n{comment} {mood}\n\n{disclaimer}',
      low: 'Hmm, the stars are not aligned right now. But hey, good friends are precious too~',
      midlow: 'There is a small spark! Take it slow, it might grow~',
      mid: 'Pretty compatible! Just chat more to connect even better~',
      high: 'Wow, such a great match! KANA can feel the chemistry from here~',
      soulmate: 'Uwaaah, nearly perfect! Like a couple from KANA favorite drama~',
      disclaimer: 'Note: this is just a fun game from KANA, not a real prediction. Love is about hearts and effort, not a bot percentage~',
      againBtn: '💕 Check Again',
      khodamBtn: '👻 Check Khodam',
      footer: 'KANA fun checks',
    },
  },
}

function parseNames(ctx) {
  const mentions = ctx.mentionedJids ?? []
  const raw = (ctx.text || '').trim()
  if (mentions.length >= 2) {
    return [mentions[0].replace(/\D/g, ''), mentions[1].replace(/\D/g, '')]
  }
  if (mentions.length === 1 && raw) {
    const name = raw.replace(/@\d+/g, '').trim()
    if (name) return [name, mentions[0].replace(/\D/g, '')]
  }
  for (const sep of [' & ', ' + ', ',', ' dan ', ' and ', ' x ']) {
    if (raw.toLowerCase().includes(sep)) {
      const [a, b] = raw.split(new RegExp(sep.replace(/[.*+?^${'{}'}()|[\\]\\\\]/g, '\\$&'), 'i'))
      if (a?.trim() && b?.trim()) return [a.trim(), b.trim()]
    }
  }
  const words = raw.split(/\s+/).filter(Boolean)
  if (words.length >= 2) return [words[0], words.slice(1).join(' ')]
  return null
}

export async function handler(ctx) {
  const names = parseNames(ctx)
  if (!names) return ctx.reply(ctx.t('cekjodoh.usage'))
  const [name1, name2] = names
  const percent = lovePercent(name1, name2)
  const body = ctx.t('cekjodoh.result', {
    name1,
    name2,
    percent,
    comment: ctx.t(`cekjodoh.${loveCategory(percent)}`),
    mood: ctx.say('senang'),
    disclaimer: ctx.t('cekjodoh.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('cekjodoh.footer'),
    replies: [
      { text: ctx.t('cekjodoh.againBtn'), id: '.cekjodoh' },
      { text: ctx.t('cekjodoh.khodamBtn'), id: '.cekkhodam' },
    ],
    textFallback: body,
  })
}
