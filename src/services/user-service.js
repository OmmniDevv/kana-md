// Layanan profil pengguna: XP, level, limit harian, ban, dan field bebas
// untuk fitur lain (RPG menyimpan balance/inventory/pet di profil yang sama).
// Penyimpanan: namespace 'users', key = digit nomor (tanpa akhiran JID).
// Field bahasa tetap di key terpisah '<digit>:lang' seperti base.
export const DEFAULT_DAILY_LIMIT = 30
export const XP_PER_COMMAND = 3

export function levelFromXp(xp) {
  const n = Math.max(0, Math.floor(Number(xp) || 0))
  return Math.floor(Math.sqrt(n / 50)) + 1
}

export function xpForLevel(level) {
  const l = Math.max(1, Math.floor(Number(level) || 1))
  return 50 * (l - 1) * (l - 1)
}

// Tanggal hari ini zona Asia/Jakarta, format YYYY-MM-DD.
export function wibDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function defaultProfile() {
  return {
    xp: 0,
    balance: 0,
    banned: false,
    registeredAt: null,
    name: '',
    limitDate: '',
    limitLeft: DEFAULT_DAILY_LIMIT,
    inventory: {},
    pet: null,
    job: '',
    clanId: '',
    lastDaily: '',
    lastHourly: 0,
    lastWeekly: '',
  }
}

export async function getProfile(storage, digits) {
  const saved = await storage.get('users', digits)
  return { ...defaultProfile(), ...(saved ?? {}) }
}

export async function saveProfile(storage, digits, profile) {
  await storage.set('users', digits, profile)
  return profile
}

export async function updateProfile(storage, digits, patch) {
  const profile = await getProfile(storage, digits)
  Object.assign(profile, patch)
  return saveProfile(storage, digits, profile)
}

// Tambah XP, kembalikan profil terbaru + info naik level.
export async function addXp(storage, digits, amount) {
  const profile = await getProfile(storage, digits)
  const before = levelFromXp(profile.xp)
  profile.xp = Math.max(0, profile.xp + (Number(amount) || 0))
  const after = levelFromXp(profile.xp)
  await saveProfile(storage, digits, profile)
  return { profile, leveledUp: after > before, level: after }
}

// Keadaan limit hari ini (reset otomatis saat tanggal WIB berganti).
export function limitState(profile, date = new Date()) {
  const today = wibDateString(date)
  if (profile.limitDate !== today) return { date: today, left: DEFAULT_DAILY_LIMIT }
  return { date: today, left: Math.max(0, profile.limitLeft ?? DEFAULT_DAILY_LIMIT) }
}

// Konsumsi limit sebesar cost. Mengembalikan { ok, left }.
export async function consumeLimit(storage, digits, cost = 1) {
  const profile = await getProfile(storage, digits)
  const state = limitState(profile)
  const c = Math.max(0, Number(cost) || 0)
  if (state.left < c) return { ok: false, left: state.left }
  profile.limitDate = state.date
  profile.limitLeft = state.left - c
  await saveProfile(storage, digits, profile)
  return { ok: true, left: profile.limitLeft }
}

// Leaderboard XP: [{ digits, xp, level }] urut XP tertinggi.
export async function xpLeaderboard(storage, max = 10) {
  let keys = []
  try {
    keys = await storage.keys('users')
  } catch {
    return []
  }
  const rows = []
  for (const key of keys) {
    if (!/^\d+$/.test(key)) continue
    const profile = await getProfile(storage, key)
    rows.push({ digits: key, xp: profile.xp || 0, level: levelFromXp(profile.xp || 0), name: profile.name || '' })
  }
  rows.sort((a, b) => b.xp - a.xp)
  return rows.slice(0, max)
}
