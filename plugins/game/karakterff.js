// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka generik. Sekarang info karakter Free Fire dari dataset kurasi
// lokal: skill dan perannya. Jujur di deskripsi: data kurasi lokal KANA,
// bukan data live dari server game.
export const config = {
  name: 'karakterff',
  alias: ['ffchar'],
  category: 'game',
  description: { id: 'Info karakter Free Fire dari data kurasi lokal: skill aktif/pasif dan peran (bukan data live)', en: 'Free Fire character info from local curated data: active/passive skills and roles (not live data)' },
  usage: '.karakterff | .karakterff <nama karakter>',
  example: '.karakterff alok',
  cooldown: 5,
}

export const CHARACTERS = [
  { name: 'Alok', skill: 'Drop the Beat (aktif)', role: 'Support healer', note: { id: 'Aura yang memulihkan HP dan menambah kecepatan gerak satu tim', en: 'An aura that heals HP and boosts movement speed for the team' } },
  { name: 'Chrono', skill: 'Time Turner (aktif)', role: 'Defender', note: { id: 'Kubah perisai yang menahan tembakan dari luar', en: 'A shield dome that blocks shots from outside' } },
  { name: 'Skyler', skill: 'Riptide Rhythm (aktif)', role: 'Rusher', note: { id: 'Gelombang sonik penghancur gloo wall plus heal saat memakainya', en: 'A sonic wave that breaks gloo walls and heals on use' } },
  { name: 'Kelly', skill: 'Dash (pasif)', role: 'Rusher', note: { id: 'Kecepatan lari bertambah, cocok buat rotasi cepat', en: 'Extra sprint speed, great for fast rotations' } },
  { name: 'Hayato', skill: 'Bushido (pasif)', role: 'Rusher', note: { id: 'Penetrasi armor naik saat HP menurun', en: 'Armor penetration rises as HP drops' } },
  { name: 'Moco', skill: 'Hacker Eye (pasif)', role: 'Support intel', note: { id: 'Menandai musuh yang kena tembak supaya terlihat tim', en: 'Marks shot enemies so the team can see them' } },
  { name: 'Maxim', skill: 'Gluttony (pasif)', role: 'Survivor', note: { id: 'Makan jamur dan pakai medkit lebih cepat', en: 'Eats mushrooms and uses medkits faster' } },
  { name: 'Laura', skill: 'Sharp Shooter (pasif)', role: 'Sniper support', note: { id: 'Akurasi naik besar saat memakai scope', en: 'Accuracy rises a lot while scoped' } },
  { name: 'Rafael', skill: 'Dead Silent (pasif)', role: 'Sniper', note: { id: 'Tembakan sniper tidak terlihat di minimap', en: 'Sniper shots stay hidden on the minimap' } },
  { name: 'Dasha', skill: 'Partying On (pasif)', role: 'Survivor', note: { id: 'Mengurangi damage jatuh dan recoil senjata', en: 'Reduces fall damage and weapon recoil' } },
]

export function findCharacter(query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return null
  return CHARACTERS.find((c) => c.name.toLowerCase() === q) ?? CHARACTERS.find((c) => c.name.toLowerCase().includes(q)) ?? null
}

export const i18n = {
  id: {
    karakterff: {
      list: '╭─❏ 🔥 「 *KARAKTER FREE FIRE (LOKAL)* 」\n┊ {rows}\n┊ \n┊ Data kurasi lokal KANA, bukan data live.\n┊ Detail: *.karakterff <nama karakter>*\n╰━━━━━━━',
      detail: '╭─❏ 🔥 「 *{name}* 」\n┊ ꜱᴋɪʟʟ: *{skill}*\n┊ ᴘᴇʀᴀɴ: *{role}*\n┊ {note}\n╰━━━━━━━',
      notFound: '╭─❏ 🔥 「 *KARAKTER FREE FIRE* 」\n┊ Karakter *{q}* belum ada di data lokal KANA. Yang tersedia: {names}\n╰━━━━━━━',
    },
  },
  en: {
    karakterff: {
      list: '╭─❏ 🔥 「 *FREE FIRE CHARACTERS (LOCAL)* 」\n┊ {rows}\n┊ \n┊ KANA local curated data, not live data.\n┊ Details: *.karakterff <character name>*\n╰━━━━━━━',
      detail: '╭─❏ 🔥 「 *{name}* 」\n┊ ꜱᴋɪʟʟ: *{skill}*\n┊ ʀᴏʟᴇ: *{role}*\n┊ {note}\n╰━━━━━━━',
      notFound: '╭─❏ 🔥 「 *FREE FIRE CHARACTERS* 」\n┊ Character *{q}* is not in KANA local data yet. Available: {names}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.karakterff alok', expect: /alok/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) {
    const rows = CHARACTERS.map((c) => `*${c.name}* (${c.role})`).join('\n┊ ')
    return ctx.reply(ctx.t('karakterff.list', { rows }))
  }
  const c = findCharacter(q)
  if (!c) return ctx.reply(ctx.t('karakterff.notFound', { q, names: CHARACTERS.map((x) => x.name).join(', ') }))
  return ctx.reply(ctx.t('karakterff.detail', { name: c.name, skill: c.skill, role: c.role, note: c.note[ctx.lang] ?? c.note.id }))
}
