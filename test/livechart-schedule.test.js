import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseLivechartSchedule } from '../src/scrapers/anime/livechart.js'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = readFileSync(join(here, 'fixtures', 'livechart-schedule.html'), 'utf8')

test('LiveChart schedule: markup saat ini terbaca, hari ini didahulukan', () => {
  const rows = parseLivechartSchedule(fixture)
  assert.equal(rows.length, 4)
  // Seksi .lc-today muncul sebelum hari masa depan walau di dokumen belakangan.
  assert.equal(rows[0].title, 'Chocotto Yabacity')
  assert.equal(rows[0].id, '13795')
  assert.equal(rows[0].episode, '2')
  assert.equal(rows[0].time, '3:55 AM')
  assert.equal(rows[0].datetime, '2026-11-05T03:55:00-05:00')
  assert.equal(rows[0].url, 'https://www.livechart.me/anime/13795')
  assert.equal(rows[1].episode, '11')
  assert.equal(rows[2].title, 'Later Today Show')
  assert.equal(rows[2].time, '4:55 AM')
  assert.equal(rows[3].title, 'Future Show Alpha')
})

test('LiveChart schedule: limit memotong sesudah urutan hari ini', () => {
  const rows = parseLivechartSchedule(fixture, 2)
  assert.equal(rows.length, 2)
  assert.equal(rows[1].title, 'Second Today Show')
})

test('LiveChart schedule: tanpa pembungkus hari tetap terbaca dari body', () => {
  const html = `<div class="lc-timetable-timeslot">
    <time datetime="2026-11-05T09:00:00-05:00" data-timeslot-target="time">9:00 AM</time>
    <div class="lc-timetable-anime-block" data-anime-item-id="999" data-anime-item-romanized-native-title="Loose Show">
      <a class="lc-timetable-anime-block__label"><strong>EP3</strong></a>
    </div></div>`
  const rows = parseLivechartSchedule(html)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].title, 'Loose Show')
  assert.equal(rows[0].episode, '3')
})

test('LiveChart schedule: HTML kosong membalas array kosong', () => {
  assert.deepEqual(parseLivechartSchedule(''), [])
  assert.deepEqual(parseLivechartSchedule('<p>tidak ada jadwal</p>'), [])
})
