// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka generik. Sekarang info MLBB dari dataset kurasi lokal: tier list
// per hero dan counter-nya. Jujur di deskripsi: data kurasi lokal KANA,
// bukan data live dari server game.
export const config = {
  name: 'mlbb',
  alias: ['ml'],
  category: 'game',
  description: { id: 'Info MLBB dari data kurasi lokal: tier list hero dan hero counter-nya (bukan data live)', en: 'MLBB info from local curated data: hero tier list and counters (not live data)' },
  usage: '.mlbb | .mlbb <nama hero>',
  example: '.mlbb fanny',
  cooldown: 5,
}

// Tier dan counter adalah kurasi lokal berdasarkan pengetahuan umum
// meta Mobile Legends; bisa berubah mengikuti patch resmi.
export const HEROES = [
  { name: 'Fanny', role: 'Assassin', tier: 'S', counters: ['Khufra', 'Minsitthar', 'Saber'], note: { id: 'Ratu kabel, mobilitas tertinggi; lemah lawan crowd control yang mengunci gerakan', en: 'Cable queen, highest mobility; weak against lockdown crowd control' } },
  { name: 'Ling', role: 'Assassin', tier: 'S', counters: ['Khufra', 'Kaja', 'Franco'], note: { id: 'Assassin dinding, burst besar; butuh buff biru dan lemah lawan suppress', en: 'Wall assassin with big burst; needs blue buff and is weak to suppress' } },
  { name: 'Valentina', role: 'Mage', tier: 'S', counters: ['Baxia', 'Lolita', 'Kagura'], note: { id: 'Bisa meniru ultimate lawan; kuat di teamfight panjang', en: 'Can copy enemy ultimates; strong in long teamfights' } },
  { name: 'Novaria', role: 'Mage', tier: 'A', counters: ['Ling', 'Hayabusa', 'Kagura'], note: { id: 'Poke jarak sangat jauh; rapuh bila ditempel assassin', en: 'Very long range poke; fragile when assassins get close' } },
  { name: 'Arlott', role: 'Fighter', tier: 'S', counters: ['Minsitthar', 'Phoveus', 'Terizla'], note: { id: 'Dash reset dari pasifnya membuat dia lincah di EXP lane', en: 'Passive dash resets make him slippery in the EXP lane' } },
  { name: 'Khufra', role: 'Tank', tier: 'S', counters: ['Valir', 'Diggie', 'Karrie'], note: { id: 'Bola pantulnya membatalkan hampir semua dash lawan', en: 'His bouncing ball cancels almost every enemy dash' } },
  { name: 'Karrie', role: 'Marksman', tier: 'A', counters: ['Lolita', 'Belerick', 'Hayabusa'], note: { id: 'True damage persen HP, penghancur tank di late game', en: 'Percent HP true damage, a late game tank shredder' } },
  { name: 'Beatrix', role: 'Marksman', tier: 'A', counters: ['Hayabusa', 'Ling', 'Natalia'], note: { id: 'Empat senjata, fleksibel di semua fase; mekanik tinggi', en: 'Four weapons, flexible in every phase; high mechanics' } },
  { name: 'Fredrinn', role: 'Fighter/Tank', tier: 'S', counters: ['Karrie', 'Lunox', 'Valir'], note: { id: 'Sustain besar dari kristal energi; lemah lawan true damage', en: 'Huge sustain from energy crystals; weak to true damage' } },
  { name: 'Mathilda', role: 'Support/Assassin', tier: 'A', counters: ['Khufra', 'Phoveus', 'Minsitthar'], note: { id: 'Mobilitas tim lewat Guiding Wind, enak buat rotasi cepat', en: 'Team mobility via Guiding Wind, great for fast rotations' } },
  { name: 'Gloo', role: 'Tank', tier: 'B', counters: ['Karrie', 'Lunox', 'Faramis'], note: { id: 'Menempel ke lawan dan membelah diri; kuat mengganggu backline', en: 'Sticks to enemies and splits; great at disrupting the backline' } },
  { name: 'Hayabusa', role: 'Assassin', tier: 'A', counters: ['Saber', 'Kaja', 'Eudora'], note: { id: 'Split push dan burst bayangan; kalah lawan kunci titik langsung', en: 'Split push and shadow burst; loses to direct point lock' } },
]

export function findHero(query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return null
  return HEROES.find((h) => h.name.toLowerCase() === q) ?? HEROES.find((h) => h.name.toLowerCase().includes(q)) ?? null
}

export const i18n = {
  id: {
    mlbb: {
      list: '╭─❏ 🎮 「 *MLBB: TIER LIST LOKAL* 」\n┊ {rows}\n┊ \n┊ Data kurasi lokal KANA, bukan data live; meta bisa berubah tiap patch.\n┊ Detail dan counter: *.mlbb <nama hero>*\n╰━━━━━━━',
      detail: '╭─❏ 🎮 「 *{name}* 」\n┊ ʀᴏʟᴇ: *{role}*\n┊ ᴛɪᴇʀ ʟᴏᴋᴀʟ: *{tier}*\n┊ ᴄᴏᴜɴᴛᴇʀ: *{counters}*\n┊ {note}\n╰━━━━━━━',
      notFound: '╭─❏ 🎮 「 *MLBB* 」\n┊ Hero *{q}* belum ada di data lokal KANA. Yang tersedia: {names}\n╰━━━━━━━',
    },
  },
  en: {
    mlbb: {
      list: '╭─❏ 🎮 「 *MLBB: LOCAL TIER LIST* 」\n┊ {rows}\n┊ \n┊ KANA local curated data, not live data; the meta changes every patch.\n┊ Details and counters: *.mlbb <hero name>*\n╰━━━━━━━',
      detail: '╭─❏ 🎮 「 *{name}* 」\n┊ ʀᴏʟᴇ: *{role}*\n┊ ʟᴏᴄᴀʟ ᴛɪᴇʀ: *{tier}*\n┊ ᴄᴏᴜɴᴛᴇʀꜱ: *{counters}*\n┊ {note}\n╰━━━━━━━',
      notFound: '╭─❏ 🎮 「 *MLBB* 」\n┊ Hero *{q}* is not in KANA local data yet. Available: {names}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.mlbb fanny', expect: /fanny/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) {
    const rows = HEROES.map((h) => `*${h.tier}* ${h.name} (${h.role})`).join('\n┊ ')
    return ctx.reply(ctx.t('mlbb.list', { rows }))
  }
  const hero = findHero(q)
  if (!hero) return ctx.reply(ctx.t('mlbb.notFound', { q, names: HEROES.map((h) => h.name).join(', ') }))
  return ctx.reply(ctx.t('mlbb.detail', {
    name: hero.name, role: hero.role, tier: hero.tier,
    counters: hero.counters.join(', '), note: hero.note[ctx.lang] ?? hero.note.id,
  }))
}
