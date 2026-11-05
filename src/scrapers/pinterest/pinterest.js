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

// Urutan rendisi video PROGRESIF (MP4 langsung). Rendisi V_HLS* adalah
// playlist m3u8, bukan berkas video; memasukkannya ke field video membuat
// pengirim mengirim teks playlist sebagai video (kasus live .pinvid
// 2026-11-06). Terverifikasi dari VM: V_EXP7 mengunduh MP4 asli (ftyp).
const VIDEO_KEYS = ['V_720P', 'V_EXP7', 'V_EXP6', 'V_EXP5', 'V_EXP4', 'V_EXP3', 'V_480P', 'V_360P']

export function progressiveVideoUrl(videoList) {
  const list = videoList || {}
  for (const key of VIDEO_KEYS) {
    if (list[key]?.url) return list[key].url
  }
  for (const [key, value] of Object.entries(list)) {
    if (!key.includes('HLS') && value?.url && value.url.endsWith('.mp4')) return value.url
  }
  return null
}

export function mapPin(pin) {
  const images = pin.images || {}
  const videoList = pin.videos?.video_list || {}
  const image = images.orig?.url || images['736x']?.url || images['564x']?.url || images['236x']?.url || null
  const video = progressiveVideoUrl(videoList)
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
    // Kolom tambahan dari pemetaan snippet Pinterest kiriman user 2026-11-05.
    description: pin.description?.trim() || null,
    externalLink: pin.link || null,
    dominantColor: pin.dominant_color || null,
    stats: {
      saves: pin.repin_count || pin.aggregated_pin_data?.aggregated_stats?.saves || 0,
      comments: pin.comment_count || 0,
    },
  }
}

async function searchPinterest(query, session, limit, scope = 'pins') {
  const sourceUrl = `/search/${scope}/?q=${encodeURIComponent(query)}`
  const payload = { options: { query, scope, bookmarks: [], page_size: limit }, context: {} }
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

// Fallback POST dengan paginasi bookmark, adaptasi dari snippet Pinterest
// kiriman user 2026-11-05 (BaseSearchResource POST + bookmark). Header spoof
// IP (X-Forwarded-For acak) dari snippet TIDAK dipakai; sesi polos seperti
// jalur utama. Dipakai bila jalur GET gagal atau hasilnya kosong.
async function searchPinterestPost(query, session, limit) {
  const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`
  const pins = []
  let bookmark = null
  for (let page = 0; page < 10 && pins.length < limit; page++) {
    const options = {
      query,
      scope: 'pins',
      appliedProductFilters: '---',
      domains: null,
      user: null,
      seoDrawerEnabled: false,
      applied_unified_filters: null,
      auto_correction_disabled: false,
      journey_depth: null,
      source_id: null,
      source_module_id: null,
      source_url: sourceUrl,
      static_feed: false,
      selected_one_bar_modules: null,
      query_pin_sigs: null,
      page_size: null,
      price_max: null,
      price_min: null,
      query_image_pins: null,
      request_params: null,
      top_pin_ids: null,
      article: null,
      corpus: null,
      customized_rerank_type: null,
      filters: null,
      rs: 'typed',
      redux_normalize_feed: true,
      bookmarks: bookmark ? [bookmark] : [],
    }
    const body = new URLSearchParams()
    body.append('source_url', sourceUrl)
    body.append('data', JSON.stringify({ options, context: {} }))
    const response = await request(`${CONFIG.baseUrl}/resource/BaseSearchResource/get/`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        accept: 'application/json, text/javascript, */*, q=0.01',
        'content-type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
        'x-pinterest-appstate': 'active',
        'x-pinterest-source-url': sourceUrl,
        referer: `${CONFIG.baseUrl}${sourceUrl}`,
        ...(session.csrf ? { 'x-csrftoken': session.csrf } : {}),
        ...(session.cookies ? { cookie: session.cookies } : {}),
      },
      body,
    })
    const json = await response.json()
    const resource = json?.resource_response
    if (!resource) throw new Error('Respons Pinterest tidak memiliki resource_response.')
    if (resource.error) throw new Error(resource.error.message || 'Pinterest mengembalikan error.')
    const results = Array.isArray(resource.data) ? resource.data : resource.data?.results || []
    pins.push(...results.filter((pin) => pin?.id))
    bookmark = resource.bookmark ?? null
    if (!bookmark) break
  }
  const seen = new Set()
  return pins.filter((pin) => (seen.has(pin.id) ? false : (seen.add(pin.id), true))).slice(0, limit).map(mapPin)
}

export async function pinterestSearch(query, { limit = CONFIG.limit } = {}) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Keyword pencarian tidak boleh kosong.')
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || CONFIG.limit))
  const session = await createSession()
  let results = []
  try {
    results = await searchPinterest(keyword, session, safeLimit)
  } catch {
    results = []
  }
  if (!results.length) {
    results = await searchPinterestPost(keyword, session, safeLimit)
  }
  return { status: true, query: keyword, total: results.length, results }
}

// Pencarian khusus pin video (scope 'videos'). Pencarian scope 'pins' tidak
// pernah memuat data video (terverifikasi dari VM 2026-11-06: 0 video dari
// puluhan pin di beberapa kueri), sedangkan scope 'videos' membalas pin
// yang semuanya memiliki videos.video_list. Dipakai .pinvid.
export async function pinterestVideoSearch(query, { limit = CONFIG.limit } = {}) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Keyword pencarian tidak boleh kosong.')
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || CONFIG.limit))
  const session = await createSession()
  const results = await searchPinterest(keyword, session, safeLimit, 'videos')
  const videos = results.filter((pin) => pin.video)
  return { status: true, query: keyword, total: videos.length, results: videos }
}

export default pinterestSearch
