// Pola deteksi murni untuk proteksi grup. Tanpa I/O, semua fungsi di sini
// mudah dites: teks masuk, hasil boolean/daftar keluar.

const LINK_PATTERNS = [
  { name: 'http', re: /https?:\/\/[^\s]+/i },
  { name: 'www', re: /\bwww\.[^\s]+\.[a-z]{2,}/i },
  { name: 'whatsapp-group', re: /chat\.whatsapp\.com\/[^\s]+/i },
  { name: 'telegram', re: /(?:t\.me|telegram\.me)\/[^\s]+/i },
  { name: 'bitly', re: /bit\.ly\/[^\s]+/i },
  { name: 'shortlink', re: /\b(?:tinyurl\.com|s\.id|rebrand\.ly|cutt\.ly|rb\.gy|shorturl\.at|is\.gd|t\.co)\/[^\s]+/i },
  { name: 'domain', re: /\b[a-z0-9-]+\.(?:com|net|org|io|xyz|top|site|online|click|info|biz|id|co|me|app|dev|gg|live|store|club|vip|win|bet|asia|link)\/[^\s]+/i },
]

export function detectLinks(text) {
  const s = String(text ?? '')
  const hits = []
  for (const p of LINK_PATTERNS) if (p.re.test(s)) hits.push(p.name)
  return hits
}

const GAMBLING_WORDS = [
  'slot', 'judi', 'gacor', 'maxwin', 'zeus', 'deposit pulsa', 'daftar situs', 'rtp', 'togel',
  'judi online', 'slot online', 'situs slot', 'bandar togel', 'taruhan', 'casino', 'kasino online',
  'poker online', 'dominoqq', 'scatter', 'jackpot', 'freebet', 'bonus new member', 'betting',
  'parlay', 'sbobet', 'pragmatic play', 'mahjong ways', 'olympus', 'starlight princess',
]

function includesWord(s, word) {
  if (word.includes(' ')) return s.includes(word)
  return new RegExp(`\\b${word.replace(/[.*+?^${'{}'}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i').test(s)
}

export function detectGambling(text) {
  const s = String(text ?? '').toLowerCase()
  const hits = GAMBLING_WORDS.filter((w) => includesWord(s, w))
  // 'bet' sendirian terlalu umum, hanya hitung bila ada konteks judi lain atau pola angka bet.
  const betAlone = hits.length === 1 && hits[0] === 'bet'
  if (/\bbet\b/i.test(s) && /(?:rp|ribu|juta|\d+\s*k\b|taruhan|menang)/i.test(s)) {
    if (!hits.includes('bet')) hits.push('bet')
    return hits
  }
  return betAlone ? [] : hits
}

const PHISHING_PHRASES = [
  'verifikasi akun', 'klaim hadiah', 'hadiah gratis', 'akun anda akan diblokir',
  'akun kamu akan diblokir', 'login untuk verifikasi', 'masukkan kode otp', 'kirim kode otp',
  'selamat anda menang', 'selamat kamu menang', 'anda terpilih', 'kamu terpilih',
  'dapatkan uang', 'uang gratis', 'saldo gratis', 'pulsa gratis', 'bantuan pemerintah cair',
  'cek bantuan', 'verifikasi sekarang', 'konfirmasi akun', 'password anda', 'kata sandi anda',
]
const SUSPICIOUS_DOMAINS = /(?:\.xyz|\.top|\.click|\.site|\.online|\.win|\.vip|\.club|bit\.ly|tinyurl\.com|s\.id\/|cutt\.ly|rb\.gy)/i

export function detectPhishing(text) {
  const s = String(text ?? '').toLowerCase()
  const hits = []
  for (const phrase of PHISHING_PHRASES) if (s.includes(phrase)) hits.push(phrase)
  const hasLink = detectLinks(text).length > 0
  const suspicious = SUSPICIOUS_DOMAINS.test(s)
  if (hits.length && hasLink) hits.push('link')
  if (suspicious && /(gratis|hadiah|menang|klaim|uang|saldo|login|verifikasi)/i.test(s)) hits.push('suspicious-domain')
  // Kuat: ada frasa phishing plus link, atau domain mencurigakan plus janji.
  const strong = (hits.includes('link')) || hits.includes('suspicious-domain')
  return strong ? hits : []
}

const TOXIC_WORDS = [
  'anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'babi', 'tolol', 'goblok', 'idiot',
  'bajingan', 'keparat', 'sialan', 'brengsek', 'jancok', 'asu', 'tai', 'bego', 'kampret',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'stupid', 'dick', 'pussy',
]

export function detectToxic(text, extraWords = []) {
  const s = String(text ?? '').toLowerCase()
  const words = [...TOXIC_WORDS, ...(Array.isArray(extraWords) ? extraWords : [])]
    .map((w) => String(w).toLowerCase().trim()).filter(Boolean)
  return words.filter((w) => includesWord(s, w))
}

export function floodCheck(timestamps, now = Date.now(), { limit = 5, windowMs = 10000 } = {}) {
  if (!Array.isArray(timestamps)) return false
  const recent = timestamps.filter((ts) => now - Number(ts) < windowMs)
  return recent.length > limit
}

// Terapkan satu warn ke objek settings (mutasi warns). Murni soal hitungan:
// pemanggil yang menyimpan settings dan mengeksekusi kick bila shouldKick.
export function applyWarnToSettings(settings, digits, limit) {
  const lim = Math.max(1, Number(limit) || Number(settings?.warnLimit) || 3)
  const warns = { ...(settings?.warns ?? {}) }
  const key = String(digits ?? '').replace(/\D/g, '')
  const count = (Number(warns[key]) || 0) + 1
  const shouldKick = count >= lim
  if (shouldKick) delete warns[key]
  else warns[key] = count
  return { warns, count, shouldKick, limit: lim }
}

export function isValidTime(value) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(value ?? '').trim())
  if (!m) return false
  const h = Number(m[1]); const min = Number(m[2])
  return h >= 0 && h <= 23 && min >= 0 && min <= 59
}

export function resolveTargetJids(ctx) {
  const jids = new Set()
  for (const j of ctx.mentionedJids ?? []) if (j) jids.add(j)
  if (ctx.quoted?.sender) jids.add(ctx.quoted.sender)
  for (const arg of ctx.args ?? []) {
    const raw = String(arg).trim()
    // Argumen yang memang JID utuh (nomor@s.whatsapp.net atau ...@lid) dipakai apa adanya.
    if (/^\d{5,}@(s\.whatsapp\.net|lid)$/.test(raw)) { jids.add(raw); continue }
    // Token mention "@6283..." dan nomor polos sama sama dipetakan ke JID nomor
    // telepon. Dulu token mention ditelan mentah sebagai JID semu "@6283..."
    // yang digitnya kosong, jadi konfirmasi aksi grup tampil "@" tanpa nama
    // dan aksinya jalan dua kali untuk orang yang sama.
    const d = raw.replace(/\D/g, '')
    if (d.length >= 9 && d.length <= 15) jids.add(`${d}@s.whatsapp.net`)
  }
  // Kandidat tanpa digit sama sekali di bagian depan bukan target yang sah.
  return [...jids].filter((j) => digitsOf(j))
}

export function digitsOf(jid) {
  const user = String(jid ?? '').split('@')[0].split(':')[0]
  return user.replace(/\D/g, '')
}
