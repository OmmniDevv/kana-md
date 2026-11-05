// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka generik. Sekarang profil karakter Genshin Impact dari dataset
// kurasi lokal. Jujur di deskripsi: data kurasi lokal KANA, bukan data
// live dari server game.
export const config = {
  name: 'genshinprofile',
  alias: ['giprofile'],
  category: 'game',
  description: { id: 'Profil karakter Genshin Impact dari data kurasi lokal: elemen, senjata, rarity, dan peran (bukan data live)', en: 'Genshin Impact character profiles from local curated data: element, weapon, rarity, and role (not live data)' },
  usage: '.genshinprofile | .genshinprofile <nama karakter>',
  example: '.genshinprofile raiden',
  cooldown: 5,
}

export const CHARACTERS = [
  { name: 'Raiden Shogun', element: 'Electro', weapon: 'Polearm', rarity: 5, role: 'Sub-DPS / Baterai energi tim', region: 'Inazuma' },
  { name: 'Nahida', element: 'Dendro', weapon: 'Catalyst', rarity: 5, role: 'Support reaksi Dendro', region: 'Sumeru' },
  { name: 'Zhongli', element: 'Geo', weapon: 'Polearm', rarity: 5, role: 'Perisai terkuat dan shred resistansi', region: 'Liyue' },
  { name: 'Hu Tao', element: 'Pyro', weapon: 'Polearm', rarity: 5, role: 'DPS vaporize HP rendah', region: 'Liyue' },
  { name: 'Ayaka', element: 'Cryo', weapon: 'Sword', rarity: 5, role: 'DPS freeze burst area', region: 'Inazuma' },
  { name: 'Kazuha', element: 'Anemo', weapon: 'Sword', rarity: 5, role: 'Support crowd control dan buff elemental', region: 'Inazuma' },
  { name: 'Bennett', element: 'Pyro', weapon: 'Sword', rarity: 4, role: 'Support buff ATK dan heal', region: 'Mondstadt' },
  { name: 'Xingqiu', element: 'Hydro', weapon: 'Sword', rarity: 4, role: 'Sub-DPS hydro off-field', region: 'Liyue' },
  { name: 'Furina', element: 'Hydro', weapon: 'Sword', rarity: 5, role: 'Support buff damage Fanfare', region: 'Fontaine' },
  { name: 'Venti', element: 'Anemo', weapon: 'Bow', rarity: 5, role: 'Crowd control angin area luas', region: 'Mondstadt' },
  { name: 'Ganyu', element: 'Cryo', weapon: 'Bow', rarity: 5, role: 'DPS charged shot melt/freeze', region: 'Liyue' },
  { name: 'Diluc', element: 'Pyro', weapon: 'Claymore', rarity: 5, role: 'DPS pyro klasik', region: 'Mondstadt' },
]

export function findCharacter(query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return null
  return CHARACTERS.find((c) => c.name.toLowerCase() === q) ?? CHARACTERS.find((c) => c.name.toLowerCase().includes(q)) ?? null
}

export const i18n = {
  id: {
    genshinprofile: {
      list: '╭─❏ ✨ 「 *PROFIL GENSHIN (LOKAL)* 」\n┊ {rows}\n┊ \n┊ Data kurasi lokal KANA, bukan data live.\n┊ Detail: *.genshinprofile <nama karakter>*\n╰━━━━━━━',
      detail: '╭─❏ ✨ 「 *{name}* 」\n┊ ᴇʟᴇᴍᴇɴ: *{element}* | ꜱᴇɴᴊᴀᴛᴀ: *{weapon}*\n┊ ʀᴀʀɪᴛʏ: *{rarity} bintang*\n┊ ᴘᴇʀᴀɴ: *{role}*\n┊ ᴡɪʟᴀʏᴀʜ: *{region}*\n╰━━━━━━━',
      notFound: '╭─❏ ✨ 「 *PROFIL GENSHIN* 」\n┊ Karakter *{q}* belum ada di data lokal KANA. Yang tersedia: {names}\n╰━━━━━━━',
    },
  },
  en: {
    genshinprofile: {
      list: '╭─❏ ✨ 「 *GENSHIN PROFILES (LOCAL)* 」\n┊ {rows}\n┊ \n┊ KANA local curated data, not live data.\n┊ Details: *.genshinprofile <character name>*\n╰━━━━━━━',
      detail: '╭─❏ ✨ 「 *{name}* 」\n┊ ᴇʟᴇᴍᴇɴᴛ: *{element}* | ᴡᴇᴀᴘᴏɴ: *{weapon}*\n┊ ʀᴀʀɪᴛʏ: *{rarity} star*\n┊ ʀᴏʟᴇ: *{role}*\n┊ ʀᴇɢɪᴏɴ: *{region}*\n╰━━━━━━━',
      notFound: '╭─❏ ✨ 「 *GENSHIN PROFILES* 」\n┊ Character *{q}* is not in KANA local data yet. Available: {names}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.genshinprofile raiden', expect: /raiden/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) {
    const rows = CHARACTERS.map((c) => `*${c.name}* (${c.element}, ${c.rarity}★)`).join('\n┊ ')
    return ctx.reply(ctx.t('genshinprofile.list', { rows }))
  }
  const c = findCharacter(q)
  if (!c) return ctx.reply(ctx.t('genshinprofile.notFound', { q, names: CHARACTERS.map((x) => x.name).join(', ') }))
  return ctx.reply(ctx.t('genshinprofile.detail', { name: c.name, element: c.element, weapon: c.weapon, rarity: c.rarity, role: c.role, region: c.region }))
}
