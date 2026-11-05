// Profil publik WhatsApp dari method sock library (onWhatsApp,
// profilePictureUrl, fetchStatus, getBusinessProfile). Semua yang diambil
// adalah data yang memang diekspos WhatsApp ke publik untuk sebuah nomor:
// keberadaan akun, foto profil, teks about, dan profil bisnis yang
// dipublikasikan pemiliknya. Tidak ada data registrasi non-publik di sini.
//
// Bentuk mentah fetchStatus library 1.4.7: array hasil USync, tiap entri
// { id, status: { status, setAt } } (USyncStatusProtocol); kode 401 dari
// server diterjemahkan parser menjadi status string kosong (bio disembu-
// nyikan). getBusinessProfile membalas objek profil bisnis atau gagal
// untuk akun standar. Kedua bentuk dinormalisasi di sini supaya plugin
// dan tes bekerja pada satu bentuk bersih.

// Awalan kode telepon negara ke kode ISO. Pencocokan awalan terpanjang.
const CALLING_CODES = {
  1: 'US', 7: 'RU', 20: 'EG', 27: 'ZA', 30: 'GR', 31: 'NL', 32: 'BE',
  33: 'FR', 34: 'ES', 36: 'HU', 39: 'IT', 40: 'RO', 41: 'CH', 43: 'AT',
  44: 'GB', 45: 'DK', 46: 'SE', 47: 'NO', 48: 'PL', 49: 'DE', 51: 'PE',
  52: 'MX', 53: 'CU', 54: 'AR', 55: 'BR', 56: 'CL', 57: 'CO', 58: 'VE',
  60: 'MY', 61: 'AU', 62: 'ID', 63: 'PH', 64: 'NZ', 65: 'SG', 66: 'TH',
  81: 'JP', 82: 'KR', 84: 'VN', 86: 'CN', 90: 'TR', 91: 'IN', 92: 'PK',
  93: 'AF', 94: 'LK', 95: 'MM', 98: 'IR', 212: 'MA', 213: 'DZ', 216: 'TN',
  218: 'LY', 220: 'GM', 221: 'SN', 234: 'NG', 254: 'KE', 255: 'TZ',
  256: 'UG', 351: 'PT', 352: 'LU', 353: 'IE', 354: 'IS', 358: 'FI',
  380: 'UA', 420: 'CZ', 421: 'SK', 852: 'HK', 853: 'MO', 855: 'KH',
  856: 'LA', 886: 'TW', 960: 'MV', 961: 'LB', 962: 'JO', 963: 'SY',
  964: 'IQ', 965: 'KW', 966: 'SA', 967: 'YE', 968: 'OM', 970: 'PS',
  971: 'AE', 972: 'IL', 973: 'BH', 974: 'QA', 975: 'BT', 976: 'MN',
  977: 'NP', 880: 'BD',
}

const regionNames = new Intl.DisplayNames(['id'], { type: 'region' })

// Ekstrak digit nomor dari masukan bebas: JID, @mention, atau teks nomor.
// Mengembalikan null bila digitnya di luar rentang nomor telepon wajar.
export function normalizeWaDigits(input) {
  const digits = String(input ?? '').replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 15) return null
  return digits
}

export function countryFromDigits(digits) {
  const d = String(digits ?? '')
  for (const len of [3, 2, 1]) {
    const iso = CALLING_CODES[d.slice(0, len)]
    if (iso) {
      let name = iso
      try {
        name = regionNames.of(iso) || iso
      } catch {}
      return { iso, name }
    }
  }
  return null
}

// Normalisasi hasil fetchStatus mentah menjadi { text, setAt } atau null
// bila status tidak tersedia sama sekali. Bio kosong (privasi 401)
// menghasilkan text '' supaya pemanggil bisa menampilkan penanda kosong.
export function parseWaStatus(raw, jid) {
  let node = raw
  if (Array.isArray(raw)) {
    node = raw.find((e) => e && (e.id === jid || e.jid === jid)) ?? raw[0]
  }
  if (!node) return null
  const s = node.status ?? node
  if (typeof s === 'string') return { text: s, setAt: null }
  if (!s || typeof s !== 'object') return null
  if (typeof s.status !== 'string' && !(s.setAt instanceof Date) && !s.t) return null
  let setAt = null
  if (s.setAt instanceof Date && !Number.isNaN(s.setAt.getTime())) setAt = s.setAt
  else if (s.t) setAt = new Date(Number(s.t) * 1000)
  return { text: typeof s.status === 'string' ? s.status : '', setAt }
}

// Normalisasi profil bisnis mentah menjadi bentuk bersih atau null bila
// akun bukan bisnis atau tidak ada satu pun isian yang dipublikasikan.
export function parseBusinessProfile(raw) {
  if (!raw || typeof raw !== 'object') return null
  const website = Array.isArray(raw.website) ? raw.website.filter(Boolean)[0] : raw.website
  const categories = Array.isArray(raw.categories)
    ? raw.categories.map((c) => (typeof c === 'string' ? c : c?.display_name)).filter(Boolean)
    : []
  const out = {
    description: String(raw.description || '').trim(),
    email: String(raw.email || '').trim(),
    address: String(raw.address || '').trim(),
    website: String(website || '').trim(),
    category: categories.join(', '),
    timezone: String(raw.business_hours?.timezone || '').trim(),
  }
  if (!out.description && !out.email && !out.address && !out.website && !out.category) return null
  return out
}

// Ambil profil publik lengkap satu nomor lewat sock. Method yang absen
// atau gagal di satu langkah tidak menggagalkan langkah lain, kecuali
// onWhatsApp yang menentukan keberadaan akun.
export async function fetchWaProfile(sock, digits) {
  const jid = `${digits}@s.whatsapp.net`
  const entries = await sock.onWhatsApp(digits)
  const entry = Array.isArray(entries) ? entries[0] : entries
  if (!entry?.exists) return { exists: false, jid: entry?.jid || jid, digits }
  const resolvedJid = entry.jid || jid
  const [photoUrl, statusRaw, businessRaw] = await Promise.all([
    sock.profilePictureUrl(resolvedJid, 'image').catch(() => null),
    typeof sock.fetchStatus === 'function' ? sock.fetchStatus(resolvedJid).catch(() => null) : null,
    typeof sock.getBusinessProfile === 'function' ? sock.getBusinessProfile(resolvedJid).catch(() => null) : null,
  ])
  return {
    exists: true,
    jid: resolvedJid,
    digits,
    photoUrl: photoUrl || null,
    bio: parseWaStatus(statusRaw, resolvedJid),
    business: parseBusinessProfile(businessRaw),
    country: countryFromDigits(digits),
  }
}
