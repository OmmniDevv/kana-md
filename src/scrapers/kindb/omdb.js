// OMDb API (omdbapi.com) untuk keluarga film KIND-B: kanonis .movie
// dan .imdb. Terverifikasi dari VM: pencarian (s=) dan detail (t=/i=)
// membalas HTTP 200 berisi data film asli (judul, tahun, rating IMDb,
// plot, poster). Kunci demo publik OMDb bisa ditimpa lewat env
// OMDB_API_KEY bila owner punya kunci sendiri.
const API = 'https://www.omdbapi.com/'

function apiKey() {
  return process.env.OMDB_API_KEY || 'thewdb'
}

async function omdb(params) {
  const url = `${API}?${new URLSearchParams({ ...params, apikey: apiKey() })}`
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'KANA-Bot' } })
  if (!res.ok) throw new Error(`OMDb balas HTTP ${res.status}`)
  const json = await res.json()
  if (json.Response === 'False') return null
  return json
}

export function normalizeOmdb(raw) {
  if (!raw) return null
  return {
    title: raw.Title || '-',
    year: raw.Year || '-',
    rated: raw.Rated || '-',
    runtime: raw.Runtime || '-',
    genre: raw.Genre || '-',
    director: raw.Director || '-',
    actors: raw.Actors || '-',
    plot: raw.Plot || '',
    rating: raw.imdbRating && raw.imdbRating !== 'N/A' ? raw.imdbRating : null,
    type: raw.Type || 'movie',
    poster: raw.Poster && raw.Poster !== 'N/A' ? raw.Poster : null,
    imdbId: raw.imdbID || null,
    url: raw.imdbID ? `https://www.imdb.com/title/${raw.imdbID}/` : 'https://www.imdb.com',
  }
}

export async function omdbSearch(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Judul wajib diisi')
  const json = await omdb({ s: q })
  const rows = (json?.Search || []).slice(0, limit).map((r) => ({
    title: r.Title, year: r.Year, type: r.Type, imdbId: r.imdbID,
    poster: r.Poster && r.Poster !== 'N/A' ? r.Poster : null,
  }))
  return rows
}

export async function omdbDetail(query) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Judul wajib diisi')
  const byId = /^tt\d+$/.test(q) ? await omdb({ i: q }) : null
  const raw = byId || (await omdb({ t: q }))
  return normalizeOmdb(raw)
}
