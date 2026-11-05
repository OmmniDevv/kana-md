// Profil publik TikTok dan channel YouTube dari halaman web resmi,
// untuk .cektiktok dan .cekidch. Kedua halaman terverifikasi menjawab
// HTTP 200 dari VM dan memuat data profil di JSON tertanamnya
// (TikTok: __UNIVERSAL_DATA_FOR_REHYDRATION__; YouTube: ytInitialData),
// pola yang sama dengan verifikasi KIND-A untuk profil TikTok dan
// channel YouTube.
import { randomUserAgent } from '../runner.js'

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(25000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`Situs balas HTTP ${res.status}`)
  return res.text()
}

function grab(html, re) {
  const m = String(html || '').match(re)
  return m ? m[1] : null
}

function num(html, key) {
  const v = grab(html, new RegExp(`"${key}":\\s*(\\d+)`))
  return v === null ? null : Number(v)
}

export function parseTiktokProfile(html, username) {
  if (!html || !html.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__')) return null
  const uniqueId = grab(html, /"uniqueId":"([^"]+)"/)
  if (!uniqueId) return null
  return {
    id: grab(html, /"user":\{"id":"(\d+)"/) || grab(html, /"id":"(\d+)","uniqueId"/),
    uniqueId,
    nickname: grab(html, /"nickname":"([^"]+)"/) || uniqueId,
    followers: num(html, 'followerCount'),
    following: num(html, 'followingCount'),
    videos: num(html, 'videoCount'),
    hearts: num(html, 'heartCount'),
    verified: /"verified":true/.test(html),
    url: `https://www.tiktok.com/@${uniqueId}`,
    requested: username || uniqueId,
  }
}

export async function tiktokProfile(username) {
  const u = String(username || '').trim().replace(/^@/, '')
  if (!u) throw new Error('Username wajib diisi')
  const html = await fetchHtml(`https://www.tiktok.com/@${encodeURIComponent(u)}`)
  return parseTiktokProfile(html, u)
}

export function parseYoutubeChannel(html, input) {
  if (!html) return null
  const channelId = grab(html, /"externalId":"(UC[\w-]{22})"/) || grab(html, /<meta itemprop="channelId" content="(UC[\w-]{22})"/) || grab(html, /"channelId":"(UC[\w-]{22})"/)
  if (!channelId) return null
  const title = grab(html, /<meta property="og:title" content="([^"]+)"/) || grab(html, /"title":"([^"]+)","navigationEndpoint":\{"clickTrackingParams"/) || input
  const subs = grab(html, /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/) || grab(html, /([\d.,]+[KMB]?) subscribers/i)
  const vanity = grab(html, /"vanityChannelUrl":"(http[^"]+)"/)
  return {
    channelId,
    title: String(title || '').replace(/&amp;/g, '&'),
    subscribers: subs,
    url: `https://www.youtube.com/channel/${channelId}`,
    vanity,
  }
}

export async function youtubeChannel(input) {
  const raw = String(input || '').trim()
  if (!raw) throw new Error('Tautan atau handle channel wajib diisi')
  let url = raw
  if (/^@[\w.-]+$/.test(raw)) url = `https://www.youtube.com/${raw}`
  else if (/^UC[\w-]{22}$/.test(raw)) url = `https://www.youtube.com/channel/${raw}`
  else if (!/^https?:\/\//i.test(raw)) url = `https://www.youtube.com/@${raw.replace(/^@/, '')}`
  const html = await fetchHtml(url)
  return parseYoutubeChannel(html, raw)
}
