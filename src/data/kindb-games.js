// Dataset lokal kurasi faktual untuk info game keluarga KIND-B:
// hero Mobile Legends + contoh build (.listhero, .buildml), hero
// Honor of Kings (.hok), Resonator Wuthering Waves (.wwchar), dan
// murid Blue Archive (.bluearchive-char). Nama, role, elemen, dan
// akademi adalah fakta publik game masing-masing; deskripsi plugin
// menyebut jujur bahwa ini dataset lokal kurasi, bukan API daring.

export const ML_HEROES = [
  ['Ling', 'Assassin'], ['Fanny', 'Assassin'], ['Hayabusa', 'Assassin'], ['Lancelot', 'Assassin'],
  ['Gusion', 'Assassin'], ['Nolan', 'Assassin'], ['Alucard', 'Fighter'], ['Yu Zhong', 'Fighter'],
  ['Chou', 'Fighter'], ['Paquito', 'Fighter'], ['Martis', 'Fighter'], ['Terizla', 'Fighter'],
  ['Muse', 'Marksman'], ['Wanwan', 'Marksman'], ['Brody', 'Marksman'],
  ['Beatrix', 'Marksman'], ['Melissa', 'Marksman'], ['Valentina', 'Mage'], ['Lunox', 'Mage'],
  ['Kagura', 'Mage'], ['Zhuxin', 'Mage'], ['Cecilion', 'Mage'], ['Xavier', 'Mage'],
  ['Tigreal', 'Tank'], ['Khufra', 'Tank'], ['Atlas', 'Tank'], ['Gatotkaca', 'Tank'],
  ['Chip', 'Tank'], ['Mathilda', 'Support'], ['Angela', 'Support'], ['Floryn', 'Support'],
  ['Rafaela', 'Support'], ['Diggie', 'Support'],
].filter(([name]) => name !== 'Marksman')

export const ML_BUILDS = {
  ling: ['Swift Boots', 'Berserker\'s Fury', 'Endless Battle', 'Blade of the Heptaseas', 'Malefic Roar', 'Blade of Despair'],
  fanny: ['Tough Boots', 'Blade of the Heptaseas', 'Hunter Strike', 'Malefic Roar', 'Blade of Despair', 'Immortality'],
  hayabusa: ['Swift Boots', 'Blade of the Heptaseas', 'Hunter Strike', 'Malefic Roar', 'Endless Battle', 'Blade of Despair'],
  lancelot: ['Tough Boots', 'Blade of the Heptaseas', 'Hunter Strike', 'Endless Battle', 'Malefic Roar', 'Blade of Despair'],
  gusion: ['Magic Shoes', 'Calamity Reaper', 'Shadow Twinblades', 'Holy Crystal', 'Divine Glaive', 'Blood Wings'],
  Muse: ['Swift Boots', 'Corrosion Scythe', 'Demon Hunter Sword', 'Golden Staff', 'Malefic Roar', 'Wind of Nature'],
  wanwan: ['Swift Boots', 'Corrosion Scythe', 'Demon Hunter Sword', 'Golden Staff', 'Windtalker', 'Wind of Nature'],
  brody: ['Tough Boots', 'Blade of Despair', 'Endless Battle', 'Brute Force Breastplate', 'Malefic Roar', 'Immortality'],
  chou: ['Tough Boots', 'Blade of the Heptaseas', 'Hunter Strike', 'Endless Battle', 'Malefic Roar', 'Immortality'],
  kagura: ['Magic Shoes', 'Clock of Destiny', 'Lightning Truncheon', 'Holy Crystal', 'Divine Glaive', 'Blood Wings'],
  lunox: ['Arcane Boots', 'Enchanted Talisman', 'Lightning Truncheon', 'Holy Crystal', 'Divine Glaive', 'Blood Wings'],
  valentina: ['Arcane Boots', 'Clock of Destiny', 'Lightning Truncheon', 'Holy Crystal', 'Divine Glaive', 'Winter Crown'],
  tigreal: ['Warrior Boots', 'Dominance Ice', 'Athena\'s Shield', 'Antique Cuirass', 'Radiant Armor', 'Immortality'],
  angela: ['Magic Shoes', 'Enchanted Talisman', 'Fleeting Time', 'Oracle', 'Ice Queen Wand', 'Immortality'],
}

export function findMlHero(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return null
  const hero = ML_HEROES.find(([name]) => name.toLowerCase() === q)
  if (!hero) return null
  return { name: hero[0], role: hero[1], build: ML_BUILDS[q] || null }
}

export const HOK_HEROES = [
  ['Daji', 'Mage'], ['Angela', 'Mage'], ['Zhuge Liang (Kongming)', 'Mage'], ['Diao Chan', 'Mage'],
  ['Shangguan', 'Mage'], ['Xiao Qiao', 'Mage'], ['Arthur', 'Fighter'], ['Lu Bu', 'Fighter'],
  ['Hua Mulan', 'Fighter'], ['Kaizer', 'Fighter'], ['Allain', 'Fighter'], ['Biron', 'Fighter'],
  ['Han Xin', 'Assassin'], ['Li Bai', 'Assassin'], ['Jing', 'Assassin'], ['Lam', 'Assassin'],
  ['Miyamoto Musashi', 'Assassin'], ['Nakoruru', 'Assassin'], ['Hou Yi', 'Marksman'],
  ['Luban No.7', 'Marksman'], ['Marco Polo', 'Marksman'], ['Consort Yu', 'Marksman'],
  ['Lady Sun (Sun Shangxiang)', 'Marksman'], ['Garo', 'Marksman'], ['Cai Wenji (Cai Yan)', 'Support'],
  ['Da Qiao', 'Support'], ['Guiguzi', 'Support'], ['Dun', 'Tank'], ['Lian Po', 'Tank'],
  ['Liu Shan', 'Tank/Support'],
]

export const WUWA_RESONATORS = [
  ['Jiyan', 'Aero', 'Broadblade'], ['Xiangli Yao', 'Electro', 'Gauntlets'],
  ['Yinlin', 'Electro', 'Rectifier'], ['Calcharo', 'Electro', 'Broadblade'],
  ['Encore', 'Fusion', 'Rectifier'], ['Changli', 'Fusion', 'Sword'],
  ['Jianxin', 'Aero', 'Gauntlets'], ['Yangyang', 'Aero', 'Sword'], ['Aalto', 'Aero', 'Pistols'],
  ['Verina', 'Spectro', 'Rectifier'], ['Jinhsi', 'Spectro', 'Broadblade'],
  ['Shorekeeper', 'Spectro', 'Rectifier'], ['Phoebe', 'Spectro', 'Rectifier'],
  ['Lingyang', 'Glacio', 'Gauntlets'], ['Baizhi', 'Glacio', 'Rectifier'],
  ['Sanhua', 'Glacio', 'Sword'], ['Zhezhi', 'Glacio', 'Rectifier'], ['Carlotta', 'Glacio', 'Pistols'],
  ['Chixia', 'Fusion', 'Pistols'], ['Mortefi', 'Fusion', 'Pistols'], ['Brant', 'Fusion', 'Sword'],
  ['Danjin', 'Havoc', 'Sword'], ['Taoqi', 'Havoc', 'Broadblade'], ['Camellya', 'Havoc', 'Sword'],
  ['Cantarella', 'Havoc', 'Rectifier'], ['Rover', 'Spectro/Havoc', 'Sword'],
]

export const BA_STUDENTS = [
  ['Shiroko', 'Abydos'], ['Hoshino', 'Abydos'], ['Nonomi', 'Abydos'], ['Serika', 'Abydos'], ['Ayane', 'Abydos'],
  ['Hina', 'Gehenna'], ['Iori', 'Gehenna'], ['Chinatsu', 'Gehenna'], ['Ako', 'Gehenna'],
  ['Yuuka', 'Millennium'], ['Noa', 'Millennium'], ['Alice', 'Millennium'], ['Yuzu', 'Millennium'],
  ['Momoi', 'Millennium'], ['Midori', 'Millennium'], ['Neru', 'Millennium'], ['Karin', 'Millennium'], ['Asuna', 'Millennium'],
  ['Hifumi', 'Trinity'], ['Azusa', 'Trinity'], ['Mika', 'Trinity'], ['Nagisa', 'Trinity'], ['Koharu', 'Trinity'], ['Hanako', 'Trinity'],
  ['Shun', 'Shanhaijing'], ['Saya', 'Shanhaijing'], ['Wakamo', 'Hyakkiyako'], ['Miyako', 'SRT Special Academy'],
  ['Atsuko', 'Arius'], ['Saori', 'Arius'], ['Kanna', 'Valkyrie'],
]

export function searchDataset(rows, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => row.join(' ').toLowerCase().includes(q))
}
