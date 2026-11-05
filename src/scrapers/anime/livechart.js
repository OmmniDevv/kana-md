// Scraper LiveChart.me: pencarian anime, daftar per musim, jadwal tayang,
// peringkat, dan detail anime. Adaptasi dari snippet "Anime_list" kiriman
// user 2026-11-05 (penulis tidak tercantum di file), ditulis ulang gaya KANA
// dengan pemetaan kartu yang disederhanakan. Tanpa kredensial apa pun.
import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE = 'https://www.livechart.me'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

async function fetchHtml(url) {
  try {
    const res = await axios.get(url, { headers: HEADERS, timeout: 30000 })
    return res.data
  } catch (err) {
    if (err.response?.status === 404) return null
    throw err
  }
}

function posterOf($, $elem) {
  const $img = $elem.find('img').first()
  if (!$img.length) return ''
  const srcset = $img.attr('srcset')
  if (srcset) {
    const parts = srcset.split(',')
    const last = parts[parts.length - 1].trim().split(' ')[0]
    if (last) return last.startsWith('http') ? last : BASE + last
  }
  const src = $img.attr('data-src') || $img.attr('src') || ''
  if (!src || src.includes('data:image')) return ''
  return src.startsWith('http') ? src : BASE + src
}

function parseCard($, elem) {
  const $elem = $(elem)
  let id = $elem.attr('data-anime-id') || $elem.attr('data-anime-item-id') || ''
  const $link = $elem.find('a[href^="/anime/"]').first()
  if (!id && $link.length) id = ($link.attr('href').match(/\/anime\/(\d+)/) || [])[1] || ''
  if (!id) return null
  let title = $elem.attr('data-romaji') || $elem.attr('data-anime-item-romaji-title') || $elem.attr('data-title') || ''
  if (!title) title = $elem.find('[data-anime-item-target="preferredTitle"], [data-anime-card-target="mainTitle"], .main-title a, .lc-anime-card--title').first().text().trim()
  if (!title && $link.length) title = $link.text().trim()
  if (!title) return null
  const ratingText = $elem.find('.anime-avg-user-rating, .lc-anime-card--poster-rating').first().text()
  const ratingMatch = ratingText.match(/(\d+\.\d+)/)
  const date = $elem.find('.anime-date, time[data-timestamp]').first().text().trim()
    || ($elem.find('time[data-timestamp]').attr('data-timestamp')
      ? new Date(Number($elem.find('time[data-timestamp]').attr('data-timestamp')) * 1000).toDateString()
      : '')
  const studios = []
  $elem.find('.anime-studios a, .lc-anime-card--studios a').each((_, a) => studios.push($(a).text().trim()))
  return {
    id,
    title,
    english: $elem.attr('data-english') || $elem.attr('data-anime-item-english-title') || '',
    url: `${BASE}/anime/${id}`,
    poster: posterOf($, $elem),
    rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
    premiereDate: date,
    studios: studios.filter(Boolean),
  }
}

function collectCards($, selector) {
  const out = []
  const seen = new Set()
  $(selector).each((_, elem) => {
    const card = parseCard($, elem)
    if (card && !seen.has(card.id)) { seen.add(card.id); out.push(card) }
  })
  return out
}

const CARD_SELECTOR = 'article.anime, tr[data-controller="anime-item"], [data-anime-id], [data-anime-item-id], .lc-anime, li.anime-item'

export async function livechartSearch(query) {
  const html = await fetchHtml(`${BASE}/search?q=${encodeURIComponent(query)}`)
  if (!html) return []
  const $ = cheerio.load(html)
  return collectCards($, CARD_SELECTOR)
}

export async function livechartSeason(season, year, type = 'tv') {
  const html = await fetchHtml(`${BASE}/${season}-${year}/${type}`)
  if (!html) return []
  const $ = cheerio.load(html)
  return collectCards($, CARD_SELECTOR)
}

export async function livechartRankings() {
  const html = await fetchHtml(`${BASE}/rankings/anime?metric=rating`)
  if (!html) return []
  const $ = cheerio.load(html)
  return collectCards($, 'tr[data-controller="anime-item"], article.anime, [data-anime-id]').slice(0, 25)
}

export async function livechartSchedule() {
  const html = await fetchHtml(`${BASE}/schedule`)
  if (!html) return []
  const $ = cheerio.load(html)
  const rows = []
  $('.lc-timetable-timeslot').each((_, slot) => {
    const $slot = $(slot)
    const time = $slot.find('.lc-timetable-timeslot__time [data-timeslot-target="time"]').text().trim()
      || $slot.find('.lc-current-time__content').text().trim()
    $slot.find('.lc-timetable-anime-block').each((_, el) => {
      const $el = $(el)
      const id = $el.attr('data-schedule-anime-id')
      const title = $el.attr('data-schedule-anime-title')
      const episode = $el.find('.lc-tt-release-label .font-medium').text().trim()
      if (id && title) rows.push({ id, title, url: `${BASE}/anime/${id}`, time, episode })
    })
  })
  return rows
}

export async function livechartDetail(id) {
  const html = await fetchHtml(`${BASE}/anime/${id}`)
  if (!html) return null
  const $ = cheerio.load(html)
  const $details = $('[data-controller="anime-details"]')
  const title = $details.attr('data-anime-details-romaji-title') || $('h1').first().text().trim()
  if (!title) return null
  let synopsis = ''
  $('[data-anime-details-target="spoilableText"] p, .anime-synopsis p').each((_, p) => { synopsis += $(p).text().trim() + '\n' })
  const tags = []
  $('.lc-chip-button[href^="/tags/"]').each((_, el) => tags.push($(el).text().trim()))
  const studios = []
  $('.lc-chip-button[href^="/studios/"]').each((_, el) => studios.push($(el).text().trim()))
  return {
    id: String(id),
    title,
    english: $details.attr('data-anime-details-english-title') || '',
    url: `${BASE}/anime/${id}`,
    poster: $('meta[property="og:image"]').attr('content') || '',
    synopsis: synopsis.trim(),
    tags: tags.filter(Boolean),
    studios: studios.filter(Boolean),
  }
}
