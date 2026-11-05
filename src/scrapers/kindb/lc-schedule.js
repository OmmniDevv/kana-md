// Parser jadwal LiveChart.me untuk keluarga KIND-B (.animedate).
// Modul bersama src/scrapers/anime/livechart.js membaca atribut lama
// (data-schedule-anime-id / data-schedule-anime-title) yang sudah tidak ada
// di markup LiveChart sekarang, jadi livechartSchedule() membalas kosong.
// Modul ini mandiri dan membaca struktur halaman /schedule yang sekarang:
// blok .lc-timetable-anime-block dengan data-anime-item-id dan
// data-anime-item-romanized-native-title, label episode di
// .lc-timetable-anime-block__label, dan jam di elemen time timeslot.
import * as cheerio from 'cheerio'
import { randomUserAgent } from '../runner.js'

const BASE = 'https://www.livechart.me'
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim()

export function parseLcSchedule(html, limit = 12) {
  const $ = cheerio.load(html || '')
  const collect = ($scope) => {
    const rows = []
    $scope.find('.lc-timetable-timeslot').each((_, slot) => {
      if (rows.length >= limit) return
      const $slot = $(slot)
      const $time = $slot.find('time[data-timeslot-target="time"]').first()
      const time = clean($time.text())
      const datetime = $time.attr('datetime') || ''
      $slot.find('.lc-timetable-anime-block').each((_, el) => {
        if (rows.length >= limit) return
        const $el = $(el)
        const id = $el.attr('data-anime-item-id') || ''
        const title = clean($el.attr('data-anime-item-romanized-native-title') || $el.find('.lc-timetable-anime-block__title').first().text())
        if (!title) return
        const label = clean($el.find('.lc-timetable-anime-block__label').first().text())
        const epMatch = label.match(/EP\s*(\d+)/i)
        rows.push({
          id,
          title,
          episode: epMatch ? epMatch[1] : '',
          label,
          time,
          datetime,
          url: id ? `${BASE}/anime/${id}` : BASE,
        })
      })
    })
    return rows
  }
  const $today = $('.lc-timetable-day.lc-today').first()
  const todayRows = $today.length ? collect($today) : []
  if (todayRows.length) return todayRows
  return collect($('body'))
}

export async function lcScheduleToday(limit = 12) {
  const res = await fetch(`${BASE}/schedule`, {
    signal: AbortSignal.timeout(25000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`LiveChart balas HTTP ${res.status}`)
  return parseLcSchedule(await res.text(), limit)
}
