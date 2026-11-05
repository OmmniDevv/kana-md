// Pemetaan kode alasan mesin RPG (result.reason) ke teks manusia.
// Temuan verifikasi live 2026-11-06 (Irisan 13): beberapa balasan mencetak
// kode mentah seperti (no_item), (already_in_clan), (not_found), (no_clan)
// ke user. Semua plugin yang menginterpolasi {reason} wajib lewat sini
// supaya kode internal tidak pernah tampil apa adanya.
const TEXTS = {
  already_in_clan: { id: 'kamu sudah tergabung di clan/guild', en: 'you are already in a clan/guild' },
  cooldown: { id: 'masih masa tunggu, coba lagi nanti', en: 'still on cooldown, try again later' },
  empty: { id: 'datanya masih kosong', en: 'the data is still empty' },
  expired: { id: 'sudah kedaluwarsa', en: 'it has expired' },
  format: { id: 'formatnya tidak sesuai', en: 'the format is not valid' },
  game: { id: 'sedang ada permainan yang berjalan', en: 'a game is already running' },
  has_pet: { id: 'kamu sudah punya pet', en: 'you already have a pet' },
  invalid_amount: { id: 'jumlahnya tidak valid', en: 'the amount is not valid' },
  invalid_name: { id: 'namanya tidak valid', en: 'the name is not valid' },
  mismatch: { id: 'datanya tidak cocok', en: 'the data does not match' },
  missing_materials: { id: 'bahannya kurang', en: 'materials are missing' },
  name_taken: { id: 'namanya sudah dipakai orang lain', en: 'the name is already taken' },
  no_bank: { id: 'saldo banknya kurang', en: 'not enough bank balance' },
  no_clan: { id: 'kamu belum punya clan/guild', en: 'you do not have a clan/guild yet' },
  no_coins: { id: 'koinmu tidak cukup', en: 'not enough coins' },
  no_energy: { id: 'energimu tidak cukup', en: 'not enough energy' },
  no_food: { id: 'tidak ada makanan yang bisa dipakai', en: 'no usable food' },
  no_item: { id: 'itemnya tidak ada di karungmu', en: 'the item is not in your bag' },
  no_pet: { id: 'kamu belum punya pet', en: 'you do not have a pet yet' },
  none: { id: 'tidak ada yang bisa diproses', en: 'nothing to process' },
  not_found: { id: 'yang dicari tidak ditemukan', en: 'not found' },
  not_sold: { id: 'item ini tidak dijual di sini', en: 'this item is not sold here' },
  raid: { id: 'serangan raid belum tersedia', en: 'raid attack is not available' },
  signature: { id: 'verifikasinya gagal', en: 'verification failed' },
  storage: { id: 'penyimpanannya penuh', en: 'storage is full' },
  syntax: { id: 'perintahnya kurang tepat', en: 'the command syntax is off' },
  unknown_item: { id: 'itemnya tidak dikenal', en: 'unknown item' },
  unknown_kind: { id: 'jenisnya tidak dikenal', en: 'unknown kind' },
  unknown_recipe: { id: 'resepnya tidak dikenal', en: 'unknown recipe' },
  unknown_stat: { id: 'statnya tidak dikenal', en: 'unknown stat' },
  upgrade: { id: 'belum bisa ditingkatkan', en: 'cannot be upgraded yet' },
}

export function reasonText(code, lang) {
  const entry = TEXTS[String(code ?? '')]
  if (entry) return lang === 'en' ? entry.en : entry.id
  return lang === 'en' ? 'an unexpected snag happened' : 'ada kendala yang tidak terduga'
}
