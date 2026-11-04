// Modul template pusat: satu tempat untuk teks baku bot.
// String bahasa tetap tinggal di locale inti (src/i18n/locales) dan di i18n
// plugin. File ini hanya menyimpan kunci i18n, pembangun teks baku yang
// menerima fungsi t, template default untuk teks yang bisa diatur pemakai,
// dan utilitas gaya teks murni. Konfigurasi krusial dan sensitif tetap di
// .env, bukan di sini.

// Kunci i18n untuk template baku. Nilai menunjuk ke locale inti.
export const TEMPLATE_KEYS = {
  footer: 'template.footer',
  watermark: 'template.footer',
  greeting: 'template.greeting',
  error: 'template.error',
  caption: 'template.caption',
}

export const FOOTER_KEY = TEMPLATE_KEYS.footer
export const WATERMARK_KEY = TEMPLATE_KEYS.watermark
export const GREETING_KEY = TEMPLATE_KEYS.greeting
export const ERROR_KEY = TEMPLATE_KEYS.error
export const CAPTION_KEY = TEMPLATE_KEYS.caption

// Watermark netral yang tidak butuh i18n. Dipakai bila pemanggil tidak
// menyediakan fungsi t, misalnya footer bawaan tombol.
export function neutralWatermark() {
  return process.env.BOT_NAME || 'KANA'
}

export function defaultFooterText() {
  return neutralWatermark()
}

// Baris footer watermark. Bila t tersedia dan kunci ditemukan, pakai teks
// locale. Bila t tidak ada atau mengembalikan kunci itu sendiri (tanda
// kunci hilang), jatuh ke watermark netral.
export function footerLine(t) {
  if (typeof t === 'function') {
    try {
      const value = t(TEMPLATE_KEYS.footer)
      if (typeof value === 'string' && value && value !== TEMPLATE_KEYS.footer) return value
    } catch {}
  }
  return neutralWatermark()
}

// Akhiri body teks biasa dengan baris footer watermark kecil ala Elaina:
// baris terakhir dibungkus garis bawah miring markdown (_..._).
export function withFooter(t, body) {
  const text = String(body ?? '')
  const footer = `_${footerLine(t)}_`
  if (!text.trim()) return footer
  if (text.includes(footer)) return text
  return `${text}\n\n${footer}`
}

// Template default untuk teks yang bisa diatur pemakai per grup.
// Placeholder: {user} untuk member, {group} untuk nama grup, {count}
// untuk jumlah member. Default ini dipakai bila grup belum mengatur teks
// sendiri lewat settings persisten (lihat src/services/group-settings.js).
export const DEFAULT_WELCOME =
  'Halo halo {user}~ Selamat datang di {group}! Sekarang ada {count} member di sini. Jangan lupa baca rules grup yaa, semoga betah!'
export const DEFAULT_GOODBYE =
  'Dadahh {user}~ Makasih udah pernah gabung di {group}. Sekarang sisa {count} member nih. Semoga sukses selalu yaa!'

export const USER_TEXT_DEFAULTS = {
  welcome: DEFAULT_WELCOME,
  goodbye: DEFAULT_GOODBYE,
}

// Ganti placeholder {nama} dengan vars[nama]. Aman bila vars kosong atau
// bukan objek: placeholder yang tidak punya nilai dibiarkan apa adanya,
// sama seperti interpolasi i18n inti.
export function renderTemplate(tpl, vars = {}) {
  const source = String(tpl ?? '')
  const values = vars && typeof vars === 'object' ? vars : {}
  return source.replace(/\{(\w+)\}/g, (match, name) =>
    values[name] !== undefined && values[name] !== null ? String(values[name]) : match
  )
}

const SMALL_CAPS_MAP = {
  a: 'ᴀ',
  b: 'ʙ',
  c: 'ᴄ',
  d: 'ᴅ',
  e: 'ᴇ',
  f: 'ꜰ',
  g: 'ɢ',
  h: 'ʜ',
  i: 'ɪ',
  j: 'ᴊ',
  k: 'ᴋ',
  l: 'ʟ',
  m: 'ᴍ',
  n: 'ɴ',
  o: 'ᴏ',
  p: 'ᴘ',
  q: 'ǫ',
  r: 'ʀ',
  s: 'ꜱ',
  t: 'ᴛ',
  u: 'ᴜ',
  v: 'ᴠ',
  w: 'ᴡ',
  x: 'x',
  y: 'ʏ',
  z: 'ᴢ',
}

// Gaya small caps murni untuk aksen judul: huruf a sampai z (kecil maupun
// besar) dipetakan ke small caps unicode, karakter lain tetap apa adanya.
export function smallCaps(text) {
  return String(text ?? '').replace(/[a-zA-Z]/g, (ch) => SMALL_CAPS_MAP[ch.toLowerCase()] ?? ch)
}
