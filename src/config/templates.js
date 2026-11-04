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

// Peta emoji baku untuk label tombol (aturan user 2026-11-04): tepat satu
// emoji per label, dipilih konsisten per jenis aksi dari peta ini saja.
// Nilai wajib satu karakter emoji tunggal (variation selector bawaan
// emoji itu, misalnya pada ⚔️, tetap dianggap satu emoji).
export const BUTTON_EMOJI = {
  menu: '📋',
  back: '↩️',
  download: '📥',
  search: '🔍',
  profile: '👤',
  level: '📈',
  limit: '🎫',
  leaderboard: '🏆',
  game: '🎮',
  group: '👥',
  ai: '🤖',
  random: '🎲',
  copy: '📄',
  open: '🔓',
  music: '🎵',
  video: '🎬',
  image: '🖼️',
  sticker: '🏷️',
  rpg: '⚔️',
  fun: '🎉',
  owner: '👑',
  help: '❓',
  list: '📜',
  close: '🔒',
  next: '➡️',
  retry: '🔄',
  play: '▶️',
  info: 'ℹ️',
  settings: '⚙️',
  link: '🔗',
  text: '✏️',
  quiz: '🧩',
  wallet: '👛',
  shop: '🛒',
  craft: '🔨',
  bank: '🏦',
  calendar: '📅',
  clock: '🕐',
  book: '📚',
  gift: '🎁',
  trophy: '🥇',
  heart: '❤️',
  star: '⭐',
  fire: '🔥',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  globe: '🌐',
  chat: '💬',
  mic: '🎤',
  camera: '📷',
}

// Peta nama perintah (tanpa titik) ke kunci aksi BUTTON_EMOJI. Dipakai
// untuk memilih emoji label tombol dari id tombolnya, supaya perintah
// yang sama selalu mendapat emoji yang sama di semua plugin.
export const COMMAND_EMOJI = {
  menu: 'menu',
  ping: 'info',
  help: 'help',
  owner: 'owner',
  profil: 'profile',
  daftar: 'profile',
  level: 'level',
  limit: 'limit',
  leaderboard: 'leaderboard',
  lang: 'globe',
  mode: 'settings',
  credits: 'star',
  webcode: 'link',
  listbot: 'list',
  subscribe: 'check',
  aio: 'download',
  play: 'play',
  yts: 'search',
  ytmp4: 'video',
  spotify: 'music',
  lirik: 'music',
  soundcloud: 'music',
  tiktok: 'video',
  fb: 'video',
  ig: 'download',
  pinterest: 'image',
  mediafire: 'download',
  gdrive: 'download',
  threads: 'download',
  capcut: 'video',
  ai: 'ai',
  aireset: 'retry',
  aiimg: 'image',
  vision: 'camera',
  ringkas: 'text',
  tts: 'mic',
  gambar: 'image',
  wiki: 'book',
  komik: 'book',
  font: 'text',
  chord: 'music',
  kbbi: 'book',
  anime: 'search',
  gempa: 'warning',
  cuaca: 'globe',
  kurs: 'wallet',
  terjemah: 'globe',
  sholat: 'clock',
  qr: 'camera',
  scanqr: 'camera',
  shortlink: 'link',
  ocr: 'text',
  ssweb: 'camera',
  resep: 'book',
  film: 'video',
  games: 'game',
  game: 'game',
  topgame: 'trophy',
  blackjack: 'game',
  hit: 'game',
  stand: 'game',
  slot: 'game',
  daduvs: 'game',
  suit: 'game',
  jawab: 'quiz',
  nyerah: 'cross',
  tekateki: 'quiz',
  family100: 'quiz',
  asahotak: 'quiz',
  caklontong: 'quiz',
  susunkata: 'quiz',
  tebakgambar: 'quiz',
  tebakkimia: 'quiz',
  tebakbendera: 'quiz',
  joke: 'fun',
  motivasi: 'star',
  pantun: 'text',
  bola8: 'random',
  cekpintar: 'book',
  cekmood: 'heart',
  cekberuntung: 'star',
  cekjodoh: 'heart',
  cekkhodam: 'fun',
  truth: 'chat',
  dare: 'fire',
  zodiak: 'star',
  weton: 'calendar',
  artinama: 'text',
  religi: 'book',
  ayat: 'book',
  hadits: 'book',
  rpg: 'rpg',
  menurpg: 'rpg',
  inventory: 'list',
  shop: 'shop',
  buy: 'shop',
  bank: 'bank',
  daily: 'calendar',
  hourly: 'clock',
  weekly: 'calendar',
  mining: 'craft',
  craft: 'craft',
  recipes: 'book',
  fishing: 'rpg',
  hunting: 'rpg',
  farming: 'rpg',
  dungeon: 'rpg',
  duel: 'rpg',
  clan: 'group',
  clanwar: 'rpg',
  pet: 'heart',
  job: 'wallet',
  gacha: 'gift',
  grup: 'group',
  guard: 'warning',
  protect: 'settings',
  jadwalgrup: 'calendar',
  absen: 'check',
  rules: 'book',
  setrules: 'settings',
  setwelcome: 'settings',
  setgoodbye: 'settings',
  welcome: 'group',
  customcmd: 'settings',
  sticker: 'sticker',
  attp: 'text',
  ttp: 'text',
  brat: 'sticker',
  textstyle: 'text',
  quotly: 'text',
  meme: 'image',
  smeme: 'image',
  circle: 'image',
  removebg: 'image',
  hd: 'image',
  toimg: 'image',
  emojimix: 'fun',
  carbon: 'text',
  fakechat: 'chat',
  faketweet: 'chat',
  logo: 'image',
  tomp3: 'music',
  tovideo: 'video',
  tovn: 'mic',
  catatan: 'text',
  todo: 'list',
  ingatkan: 'clock',
  jam: 'clock',
  kalkulator: 'text',
  konversi: 'retry',
  transfer: 'wallet',
  carifitur: 'search',
  ban: 'warning',
  unban: 'check',
  dbstats: 'list',
  scraperhealth: 'check',
  reload: 'retry',
  jadibot: 'chat',
  stopjadibot: 'close',
  tebakhewan: 'quiz',
  tebaknegara: 'quiz',
  tebakprovinsi: 'quiz',
  tebakmakanan: 'quiz',
  tebakprofesi: 'quiz',
  tebakkalimat: 'quiz',
  tebaksurah: 'quiz',
  tebaklagu: 'quiz',
  tebaklirik: 'quiz',
  tebakfilm: 'quiz',
  tebakgame: 'quiz',
  tebakbola: 'quiz',
  tebakdrakor: 'quiz',
  cekbaik: 'heart',
  cekbucin: 'heart',
  cekcantik: 'star',
  cekcreative: 'star',
  cekcupu: 'fun',
  cekgabut: 'fun',
  cekgacha: 'gift',
  cekgamer: 'game',
  cekganteng: 'star',
  cekgila: 'fun',
  cekimut: 'heart',
  cekintrovert: 'fun',
  cekjahat: 'fun',
  cekjomblo: 'heart',
  cekkarma: 'star',
  cekkaya: 'wallet',
  cekkece: 'star',
  cekkepribadian: 'info',
  cekkpopers: 'mic',
  ceklapar: 'fun',
  cekmalas: 'fun',
  cekngantuk: 'fun',
  cekotaku: 'fun',
  cekoverpower: 'fire',
  apakah: 'random',
  kapankah: 'clock',
  bisakah: 'check',
  benarkah: 'search',
  akankah: 'random',
  asmaulhusna: 'book',
  kisahnabi: 'book',
  hijriyah: 'calendar',
  niatsholat: 'book',
  doaharian: 'book',
  murottal: 'mic',
}

// Emoji untuk id tombol atau nama aksi. Id perintah (mis. ".menu user"
// atau ".play <url>") direduksi ke kata perintah pertamanya, lalu dicari
// di COMMAND_EMOJI; nama aksi polos (mis. "copy") dicari langsung di
// BUTTON_EMOJI. Mengembalikan '' bila tidak dikenal, supaya pemanggil
// membiarkan label apa adanya daripada menebak emoji.
export function buttonEmojiForId(id) {
  const word = String(id ?? '')
    .trim()
    .replace(/^\./, '')
    .split(/\s+/)[0]
    ?.toLowerCase()
  if (!word) return ''
  const action = COMMAND_EMOJI[word]
  if (action && BUTTON_EMOJI[action]) return BUTTON_EMOJI[action]
  return BUTTON_EMOJI[word] ?? ''
}

// Awali label tombol dengan emoji baku dari id atau aksinya. Idempoten:
// label yang sudah diawali karakter non-ASCII (emoji atau simbol) dibiarkan
// apa adanya, dan label tanpa emoji yang dikenal juga dibiarkan apa adanya.
export function withButtonEmoji(label, idOrAction) {
  const text = String(label ?? '')
  if (!text) return text
  const first = String.fromCodePoint(text.codePointAt(0))
  if (first.codePointAt(0) > 0x7f) return text
  const emoji = buttonEmojiForId(idOrAction)
  if (!emoji) return text
  return `${emoji} ${text}`
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
