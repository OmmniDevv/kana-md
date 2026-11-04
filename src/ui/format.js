// Formatter tampilan teks ala bot MD klasik (gaya Elaina-MD lama):
// bingkai box-drawing, seksi per kategori, perintah teks polos ASCII.
// Fungsi di sini murni (tanpa i18n): semua label diterjemahkan pemanggil
// lalu diteruskan lewat `labels`, jadi tidak ada string hardcoded.
import { formatRuntime } from '../services/auto-bio.js'

export { formatRuntime }

export const CATEGORY_ICONS = {
  main: '🏠',
  user: '👤',
  download: '📥',
  search: '🔍',
  ai: '🤖',
  owner: '👑',
  game: '🎮',
  group: '👥',
  maker: '🎨',
  rpg: '⚔️',
  fun: '🎲',
}

export const CATEGORY_ORDER = ['main', 'user', 'download', 'search', 'game', 'group', 'maker', 'rpg', 'fun', 'ai', 'owner']

// Urutkan kategori: yang dikenal mengikuti CATEGORY_ORDER, sisanya alfabetis.
export function sortCategories(keys) {
  return [...keys].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a)
    const ib = CATEGORY_ORDER.indexOf(b)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    return a.localeCompare(b)
  })
}

// Dirakit dari formatToParts supaya pemisah jam selalu titik dua.
function wibParts(date, lang) {
  const parts = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  return (type) => parts.find((p) => p.type === type)?.value ?? ''
}

export function formatWibDate(date = new Date(), lang = 'id') {
  const get = wibParts(date, lang)
  return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`
}

export function formatWibClock(date = new Date(), lang = 'id') {
  const get = wibParts(date, lang)
  const hour = String(Number(get('hour')) % 24).padStart(2, '0')
  return `${hour}:${get('minute')}`
}

// "Rabu, 4 November 2026 • 13:52 WIB" (en: nama hari/bulan ikut locale en-GB).
export function formatWibDateTime(date = new Date(), lang = 'id') {
  return `${formatWibDate(date, lang)} • ${formatWibClock(date, lang)} WIB`
}

// Sub-menu satu kategori: bingkai yang sama, hanya perintah kategori itu.
// category: { title, icon, commands: ['ping', ...] }; labels: { footer, subHint }
export function formatMenuCategory({ category, labels }) {
  const out = []
  out.push(`╭─❏ ${category.icon} 「 ${category.title} 」`)
  for (const name of category.commands) out.push(`│ ◦ .${name}`)
  out.push('╰━━━━━━━')
  out.push(`│ ${labels.subHint}`)
  out.push(`_${labels.footer}_`)
  return out.join('\n')
}

// categories: [{ title, icon, commands: ['ping', ...] }] (nama tanpa titik).
// labels: { greeting, runtime, mode, plugins, commands, date, hint, closing, footer }
export function formatMenu({ botName, runtimeMs, mode, pluginCount, commandCount, dateTime, categories, labels }) {
  const out = []
  out.push(`╭───「 ${botName} 」───`)
  out.push(`│ ${labels.greeting}`)
  out.push('│')
  out.push(`│ ◦ ${labels.runtime} : ${formatRuntime(runtimeMs)}`)
  out.push(`│ ◦ ${labels.mode} : ${mode}`)
  out.push(`│ ◦ ${labels.plugins} : ${pluginCount} • ${commandCount} ${labels.commands}`)
  out.push(`│ ◦ ${labels.date} : ${dateTime}`)
  out.push('╰━━━━━━━')
  for (const cat of categories) {
    out.push('')
    out.push(`╭─❏ ${cat.icon} 「 ${cat.title} 」`)
    for (const name of cat.commands) out.push(`│ ◦ .${name}`)
    out.push('╰━━━━━━━')
  }
  out.push('')
  out.push('╭─❏ 💌 ───')
  out.push(`│ ${labels.closing}`)
  out.push(`│ ${labels.hint}`)
  out.push('╰━━━━━━━')
  out.push(`_${labels.footer}_`)
  return out.join('\n')
}
