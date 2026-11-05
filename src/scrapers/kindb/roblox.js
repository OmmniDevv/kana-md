// Roblox Users API publik untuk .robloxplayer. Terverifikasi dari VM:
// users/search (limit wajib salah satu dari 10/25/50/100), users/<id>,
// dan thumbnails avatar headshot semuanya HTTP 200. API games Roblox
// tidak terjangkau (sorts 404, omni timeout/404), jadi modul ini hanya
// data pemain, bukan data game.
//
// Resolusi username WAJIB lewat endpoint persis POST /v1/usernames/users
// lebih dulu (terverifikasi 2026-11-06: builderman -> id 156). Pencarian
// kata kunci users/search bisa membalas data kosong untuk username yang
// jelas ada (kasus live .robloxplayer membalas tidak ketemu), jadi ia
// hanya cadangan, bukan penentu.
async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'KANA-Bot', Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Roblox balas HTTP ${res.status}`)
  return res.json()
}

export async function robloxResolveUsername(username) {
  const name = String(username || '').trim()
  if (!name) return null
  const res = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', Accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ usernames: [name], excludeBannedUsers: false }),
  })
  if (!res.ok) throw new Error(`Roblox balas HTTP ${res.status}`)
  const json = await res.json()
  const hit = (json.data || [])[0]
  return hit?.id ? { id: hit.id, name: hit.name, displayName: hit.displayName || hit.name } : null
}

export async function robloxSearchUsers(query, limit = 5) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Username wajib diisi')
  const json = await fetchJson(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(q)}&limit=10`)
  return (json.data || []).slice(0, limit).map((u) => ({ id: u.id, name: u.name, displayName: u.displayName || u.name }))
}

export function normalizeRobloxUser(u, headshot) {
  if (!u || !u.id) return null
  return {
    id: u.id,
    name: u.name,
    displayName: u.displayName || u.name,
    description: String(u.description || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    created: u.created ? String(u.created).slice(0, 10) : '-',
    banned: Boolean(u.isBanned),
    url: `https://www.roblox.com/users/${u.id}/profile`,
    headshot: headshot || null,
  }
}

export async function robloxUserDetail(query) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Username wajib diisi')
  let user = null
  if (/^\d+$/.test(q)) {
    user = await fetchJson(`https://users.roblox.com/v1/users/${q}`).catch(() => null)
  }
  if (!user) {
    const exact = await robloxResolveUsername(q).catch(() => null)
    const found = exact ? [exact] : await robloxSearchUsers(q, 1)
    if (!found.length) return null
    user = await fetchJson(`https://users.roblox.com/v1/users/${found[0].id}`).catch(() => null)
    if (!user) user = found[0]
  }
  let headshot = null
  try {
    const th = await fetchJson(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png`)
    headshot = th.data?.[0]?.imageUrl || null
  } catch { /* avatar gagal tidak menggagalkan data profil */ }
  return normalizeRobloxUser(user, headshot)
}
