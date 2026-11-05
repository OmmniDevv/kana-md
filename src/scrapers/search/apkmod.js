// Scraper pencarian APK tanpa kunci API (Neoxr di Elaina butuh apikey
// yang tidak dimiliki KANA). Sumber utama APKPure (halaman search
// publik), fallback Google Play lewat parser playstore yang sudah
// terbukti di plugins/search/playstore.js. Parser murni dan bisa dites.
import * as cheerio from 'cheerio'
import { downloadBuffer } from '../runner.js'
import { parsePlayStore } from '../../../plugins/search/playstore.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// Halaman aplikasi APKPure berbentuk /<slug>/<package.id>, misal
// /whatsapp-messenger/com.whatsapp. Ambil tautan seperti itu dari
// halaman hasil pencarian.
export function parseApkpureSearch(html, limit = 10) {
  const $ = cheerio.load(String(html ?? ''))
  const seen = new Set()
  const apps = []
  $('a[href]').each((_, a) => {
    if (apps.length >= limit) return
    const href = $(a).attr('href') || ''
    const m = href.match(/apkpure\.(?:com|net)\/([a-z0-9-]+)\/([a-zA-Z0-9._]+)(?:[/?#]|$)/i) || href.match(/^\/?([a-z0-9-]+)\/([a-zA-Z0-9._]+)$/i)
    if (!m) return
    const pkg = m[2]
    if (!pkg.includes('.') || seen.has(pkg)) return
    const title = ($(a).attr('title') || $(a).text() || '').replace(/\s+/g, ' ').trim()
    if (!title || title.length < 2) return
    seen.add(pkg)
    apps.push({
      name: title.slice(0, 80),
      package: pkg,
      version: '',
      mod: '',
      url: `https://apkpure.com/${m[1]}/${pkg}`,
      downloadUrl: `https://apkpure.com/${m[1]}/${pkg}/download`,
      source: 'APKPure',
    })
  })
  return apps
}

export function normalizePlayStoreApps(apps) {
  return (apps ?? []).map((a) => ({
    name: a.title,
    package: a.id,
    version: '',
    mod: '',
    url: a.url,
    downloadUrl: a.url,
    source: 'Google Play',
    dev: a.dev || '',
    rating: a.rating || '',
  }))
}

export async function searchApkmod(query, { fetchHtml } = {}) {
  const q = String(query ?? '').trim()
  if (!q) throw new Error('Kata kunci pencarian wajib diisi.')
  const get = fetchHtml ?? (async (url) => (await downloadBuffer(url, { maxBytes: 4 * 1024 * 1024, headers: { 'user-agent': UA } })).buffer.toString('utf8'))
  try {
    const html = await get(`https://apkpure.com/search?q=${encodeURIComponent(q)}`)
    const apps = parseApkpureSearch(html)
    if (apps.length) return apps
  } catch {}
  const html = await get(`https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps&hl=id`)
  return normalizePlayStoreApps(parsePlayStore(html, 10))
}
