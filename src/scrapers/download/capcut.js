// Scraper CapCut: halaman template-detail yang dibuka dengan UA mobile
// membawa meta og:video:url berisi MP4 langsung dari CDN CapCut dan
// og:title berisi nama template. Tidak perlu API bertanda tangan.
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'

export function extractCapcutUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s]*capcut\.com\/[^\s]+/i)
  return m ? m[0].replace(/[),.]+$/, '') : null
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function metaContent(html, property) {
  const re = new RegExp(`property=["']${property}["']\\s+content=["']([^"']+)["']`, 'i')
  const m = html.match(re)
  return m ? decodeEntities(m[1]) : null
}

export async function capcutDownload(url, { timeoutMs = 30000 } = {}) {
  const res = await fetch(url, {
    headers: { 'user-agent': MOBILE_UA, 'accept-language': 'en-US,en;q=0.9' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`CapCut membalas HTTP ${res.status}`)
  const html = await res.text()
  const videoUrl = metaContent(html, 'og:video:url') ?? metaContent(html, 'og:video')
  if (!videoUrl) {
    throw new Error('video template tidak ditemukan di halaman CapCut (mungkin template foto atau tautan sudah kedaluwarsa)')
  }
  const rawTitle = metaContent(html, 'og:title') ?? 'CapCut Template'
  const title = rawTitle.replace(/^CapCut template:\s*/i, '').trim() || 'CapCut Template'
  return { title, videoUrl }
}
