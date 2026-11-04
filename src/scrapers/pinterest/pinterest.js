// Scraper Pinterest: pencarian pin lewat resource internal id.pinterest.com.
// Sumber: kode kiriman user (owner) 2026-11-04, logika inti dipertahankan.
// Adaptasi kana-md: limit bisa diatur, hasil dinormalisasi { status, ... }.
const CONFIG = {
  limit: 10,
  timeout: 20000,
  baseUrl: 'https://id.pinterest.com',
}

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
}

function getCookieHeader(response) {
  return (response.headers.getSetCookie?.() || []).map((cookie) => cookie.split(';')[0]).join('; ')
}

function getCsrfToken(cookieHeader) {
  return cookieHeader.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1] || ''
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(CONFIG.timeout) })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  return response
}

async function createSession() {
  const response = await request(`${CONFIG.baseUrl}/`, { headers: HEADERS, redirect: 'follow' })
  const cookies = getCookieHeader(response)
  return { cookies, csrf: getCsrfToken(cookies) }
}

export function mapPin(pin) {
  const images = pin.images || {}
  const videoList = pin.videos?.video_list || {}
  const image = images.orig?.url || images['736x']?.url || images['564x']?.url || images['236x']?.url || null
  const video =
    videoList.V_720P?.url || videoList.V_EXP7?.url || videoList.V_HLSV4?.url || videoList.V_HLSV3_MOBILE?.url || null
  const downloads = []
  if (image) downloads.push({ type: 'image', quality: images.orig?.url ? 'Original Image' : 'Image', url: image })
  if (video) downloads.push({ type: 'video', quality: 'Pinterest Video', url: video })
  return {
    id: pin.id,
    title: pin.title || pin.grid_title || pin.auto_alt_text || '',
    url: `${CONFIG.baseUrl}/pin/${pin.id}/`,
    thumbnail: image || video || '',
    image,
    video,
    type: video ? 'video' : image ? 'image' : 'unknown',
    author: { username: pin.pinner?.username || null, name: pin.pinner?.full_name || null },
    downloads,
  }
}

async function searchPinterest(query, session, limit) {
  const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}`
  const payload = { options: { query, scope: 'pins', bookmarks: [], page_size: limit }, context: {} }
  const endpoint = new URL('/resource/BaseSearchResource/get/', CONFIG.baseUrl)
  endpoint.searchParams.set('source_url', sourceUrl)
  endpoint.searchParams.set('data', JSON.stringify(payload))
  endpoint.searchParams.set('_', Date.now().toString())

  const response = await request(endpoint, {
    headers: {
      ...HEADERS,
      accept: 'application/json, text/javascript, */*, q=0.01',
      referer: `${CONFIG.baseUrl}${sourceUrl}`,
      'x-requested-with': 'XMLHttpRequest',
      'x-pinterest-appstate': 'active',
      'x-pinterest-pws-handler': 'www/search/[scope].js',
      'x-pinterest-source-url': sourceUrl,
      ...(session.csrf ? { 'x-csrftoken': session.csrf } : {}),
      ...(session.cookies ? { cookie: session.cookies } : {}),
    },
  })

  const json = await response.json()
  const resource = json?.resource_response
  if (!resource) throw new Error('Respons Pinterest tidak memiliki resource_response.')
  if (resource.error) throw new Error(resource.error.message || 'Pinterest mengembalikan error.')
  const data = resource.data
  const pins = Array.isArray(data) ? data : data?.results || []
  return pins.filter((pin) => pin?.id).slice(0, limit).map(mapPin)
}

export async function pinterestSearch(query, { limit = CONFIG.limit } = {}) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Keyword pencarian tidak boleh kosong.')
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || CONFIG.limit))
  const session = await createSession()
  const results = await searchPinterest(keyword, session, safeLimit)
  return { status: true, query: keyword, total: results.length, results }
}

export default pinterestSearch
