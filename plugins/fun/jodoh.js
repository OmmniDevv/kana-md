
export const config = {
  name: "jodoh",
  alias: [],
  category: "fun",
  description: { id: "Fitur jodoh versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD jodoh feature, rewritten in KANA style" },
  usage: ".jodoh",
  example: ".jodoh",
  cooldown: 5,
}

export const i18n = {
  id: {
    "jodoh": {
      body: "╭─❏ 💘 「 *JODOH* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 💘 「 *JODOH* 」\n┊ Tulis dua namanya yaa, contoh *.jodoh Budi & Ani*\n╰━━━━━━━",
    },
  },
  en: {
    "jodoh": {
      body: "╭─❏ 💘 「 *JODOH* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 💘 「 *JODOH* 」\n┊ Write both names, for example *.jodoh Budi & Ani*\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.jodoh', expect: /nama|names/i }
function hashStr(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  const parts = raw.split(/\s*(?:&|dan|\+|x|,|\bvs\b)\s*/i).filter(Boolean)
  if (parts.length < 2) return ctx.reply(ctx.t('jodoh.hint'))
  const [a, b] = [parts[0].slice(0, 30), parts[1].slice(0, 30)]
  const score = 35 + (hashStr((a + '|' + b).toLowerCase()) % 66)
  const bar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10))
  const verdict = score >= 85 ? 'Cocok banget, kayak kopi sama susu~' : score >= 65 ? 'Cocok, tinggal komunikasinya dijaga' : score >= 50 ? 'Lumayan, ada potensi kalau sama-sama usaha' : 'Butuh usaha ekstra, tapi jodoh siapa yang tau~'
  return ctx.reply(ctx.t('jodoh.body', { text: '*' + a + '* x *' + b + '*\n┊ Kecocokan: *' + score + '%*\n┊ ' + bar + '\n┊ ' + verdict }))
}
