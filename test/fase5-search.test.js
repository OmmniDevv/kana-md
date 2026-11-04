import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseWikiSummary } from '../src/scrapers/search/wiki.js'
import { parseScheduleResponse, parseCitySearch } from '../src/scrapers/search/sholat.js'
import { parseRatesResponse, convertAmount } from '../src/scrapers/search/kurs.js'
import { normalizeJikanEntry } from '../src/scrapers/search/anime.js'
import { parseBingImages } from '../src/scrapers/search/gambar.js'
import { parseLatestGempa, parseGempaList } from '../src/scrapers/search/gempa.js'
import { parseTranslateResponse } from '../src/scrapers/search/terjemah.js'
import { parseGeocoding, parseForecast } from '../src/scrapers/search/cuaca.js'
import { generateQr, readQr } from '../src/scrapers/search/qr.js'
import { parseKbbiDefinitions } from '../src/scrapers/search/kbbi.js'
import { parseChordSearchResults, extractChordText } from '../src/scrapers/search/chord.js'
import { extractMediafireDownload } from '../src/scrapers/download/mediafire.js'
import { extractDriveFileId } from '../src/scrapers/download/gdrive.js'
import { detectPlatform } from '../plugins/download/aio.js'
import { weatherGroup } from '../plugins/search/cuaca.js'

test('parseWikiSummary memetakan ringkasan Wikipedia dan memotong extract', () => {
  const json = {
    title: 'Indonesia',
    description: 'negara di Asia Tenggara',
    extract: 'x'.repeat(1500),
    thumbnail: { source: 'https://thumb/img.png' },
    content_urls: { desktop: { page: 'https://id.wikipedia.org/wiki/Indonesia' } },
    lang: 'id',
  }
  const summary = parseWikiSummary(json)
  assert.equal(summary.title, 'Indonesia')
  assert.equal(summary.description, 'negara di Asia Tenggara')
  assert.ok(summary.extract.length <= 1203)
  assert.ok(summary.extract.endsWith('...'))
  assert.equal(summary.thumbnail, 'https://thumb/img.png')
  assert.equal(summary.url, 'https://id.wikipedia.org/wiki/Indonesia')
  assert.equal(parseWikiSummary(null), null)
  assert.equal(parseWikiSummary({ extract: 'tanpa judul' }), null)
})

test('parseScheduleResponse memformat jadwal myQuran dari JSON contoh', () => {
  const json = {
    status: true,
    data: {
      id: 1301,
      lokasi: 'KOTA JAKARTA',
      jadwal: {
        tanggal: 'Rabu, 04/11/2026',
        imsak: '03:58',
        subuh: '04:08',
        terbit: '05:23',
        dhuha: '05:51',
        dzuhur: '11:40',
        ashar: '14:56',
        maghrib: '17:50',
        isya: '19:01',
        date: '2026-11-04',
      },
    },
  }
  assert.deepEqual(parseScheduleResponse(json), {
    imsak: '03:58',
    subuh: '04:08',
    dzuhur: '11:40',
    ashar: '14:56',
    maghrib: '17:50',
    isya: '19:01',
  })
  assert.equal(parseScheduleResponse({ data: { jadwal: { imsak: 'x' } } }), null)
  assert.equal(parseScheduleResponse(null), null)
  assert.deepEqual(parseCitySearch({ data: [{ id: '1301', lokasi: 'KOTA JAKARTA' }] }), {
    id: '1301',
    name: 'KOTA JAKARTA',
  })
  assert.equal(parseCitySearch({ data: [] }), null)
})

test('konversi kurs dari JSON contoh er-api', () => {
  const parsed = parseRatesResponse({
    result: 'success',
    base_code: 'USD',
    time_last_update_utc: 'Wed, 04 Nov 2026 00:02:31 +0000',
    rates: { USD: 1, IDR: 16000, EUR: 0.92 },
  })
  assert.equal(parsed.base, 'USD')
  const converted = convertAmount(parsed, 100, 'IDR')
  assert.equal(converted.rate, 16000)
  assert.equal(converted.result, 1600000)
  assert.equal(convertAmount(parsed, 10, 'XXX'), null)
  assert.equal(parseRatesResponse({ result: 'error' }), null)
})

test('detectPlatform .aio untuk berbagai URL', () => {
  assert.equal(detectPlatform('https://www.youtube.com/watch?v=abc'), 'youtube')
  assert.equal(detectPlatform('https://youtu.be/abc'), 'youtube')
  assert.equal(detectPlatform('https://www.instagram.com/reel/abc/'), 'instagram')
  assert.equal(detectPlatform('https://www.facebook.com/watch/?v=1'), 'facebook')
  assert.equal(detectPlatform('https://fb.watch/abc/'), 'facebook')
  assert.equal(detectPlatform('https://www.tiktok.com/@u/video/1'), 'tiktok')
  assert.equal(detectPlatform('https://open.spotify.com/track/abc'), 'spotify')
  assert.equal(detectPlatform('https://www.mediafire.com/file/abc/x.zip/file'), 'mediafire')
  assert.equal(detectPlatform('https://drive.google.com/file/d/abc/view'), 'gdrive')
  assert.equal(detectPlatform('https://example.com/file.zip'), null)
  assert.equal(detectPlatform('bukan url'), null)
})

test('normalizeJikanEntry memetakan hasil Jikan anime dan manga', () => {
  const entry = {
    mal_id: 20,
    title: 'Naruto',
    title_english: 'Naruto',
    score: 8.0,
    episodes: 220,
    chapters: null,
    status: 'Finished Airing',
    synopsis: 'A ninja story.',
    url: 'https://myanimelist.net/anime/20',
    images: { jpg: { large_image_url: 'https://img/large.jpg', image_url: 'https://img/small.jpg' } },
  }
  const anime = normalizeJikanEntry(entry, 'anime')
  assert.equal(anime.title, 'Naruto')
  assert.equal(anime.count, 220)
  assert.equal(anime.image, 'https://img/large.jpg')
  const manga = normalizeJikanEntry({ ...entry, chapters: 700, episodes: null }, 'manga')
  assert.equal(manga.count, 700)
  assert.equal(normalizeJikanEntry(null), null)
})

test('parseBingImages mengekstrak murl dari HTML Bing', () => {
  const html = 'x murl&quot;:&quot;https://img.example.com/a.jpg&quot; y murl&quot;:&quot;https://img.example.com/b.png&quot; z'
  assert.deepEqual(parseBingImages(html), ['https://img.example.com/a.jpg', 'https://img.example.com/b.png'])
  assert.deepEqual(parseBingImages(''), [])
})

test('parse gempa BMKG terbaru dan daftar', () => {
  const raw = {
    Tanggal: '04 Nov 2026',
    Jam: '07:50:34 WIB',
    DateTime: '2026-11-04T00:50:34+00:00',
    Magnitude: '4.4',
    Kedalaman: '15 km',
    Wilayah: 'Laut 88 km timur laut Ruteng',
    Dirasakan: 'III Kab. Manggarai',
    Coordinates: '-7.94,120.89',
    Shakemap: '20261104075034.mmi.jpg',
  }
  const latest = parseLatestGempa({ Infogempa: { gempa: raw } })
  assert.equal(latest.magnitude, '4.4')
  assert.equal(latest.shakemapUrl, 'https://data.bmkg.go.id/DataMKG/TEWS/20261104075034.mmi.jpg')
  const list = parseGempaList({ Infogempa: { gempa: [raw, raw, raw] } }, 2)
  assert.equal(list.length, 2)
  assert.deepEqual(parseGempaList({}), [])
})

test('parseTranslateResponse menggabungkan segmen', () => {
  const parsed = parseTranslateResponse([[['halo ', 'hello '], ['dunia', 'world']], null, 'en'])
  assert.equal(parsed.text, 'halo dunia')
  assert.equal(parsed.detectedLang, 'en')
  assert.equal(parseTranslateResponse('<html>blocked</html>'), null)
})

test('parse cuaca Open-Meteo dan pengelompokan kode', () => {
  const geo = parseGeocoding({ results: [{ name: 'Jakarta', admin1: 'Jakarta', country: 'Indonesia', latitude: -6.2, longitude: 106.8 }] })
  assert.equal(geo.name, 'Jakarta')
  const forecast = parseForecast({
    current: { temperature_2m: 31.4, relative_humidity_2m: 70, weather_code: 61, wind_speed_10m: 12 },
    daily: { time: ['2026-11-04'], temperature_2m_max: [33], temperature_2m_min: [26], precipitation_probability_max: [80] },
    timezone: 'Asia/Jakarta',
  })
  assert.equal(forecast.current.weatherCode, 61)
  assert.equal(forecast.daily[0].max, 33)
  assert.equal(weatherGroup(0), 'clear')
  assert.equal(weatherGroup(2), 'cloudy')
  assert.equal(weatherGroup(45), 'fog')
  assert.equal(weatherGroup(53), 'drizzle')
  assert.equal(weatherGroup(65), 'rain')
  assert.equal(weatherGroup(73), 'snow')
  assert.equal(weatherGroup(81), 'heavyRain')
  assert.equal(weatherGroup(96), 'thunderstorm')
  assert.equal(weatherGroup(999), 'unknown')
})

test('QR: generate lalu read kembali isinya', async () => {
  const buffer = await generateQr('halo kana')
  assert.ok(buffer.length > 100)
  assert.equal(readQr(buffer), 'halo kana')
  assert.equal(readQr(Buffer.from('bukan gambar')), null)
})

test('parseKbbiDefinitions membaca daftar definisi dan menangani tidak ditemukan', () => {
  const html = '<html><body><ol><li>n perasaan sayang</li><li>n rasa suka</li></ol></body></html>'
  assert.deepEqual(parseKbbiDefinitions(html), ['n perasaan sayang', 'n rasa suka'])
  assert.deepEqual(parseKbbiDefinitions('<p>tidak ditemukan dalam Kamus</p>'), [])
})

test('parser chordtela: hasil pencarian dan teks pre', () => {
  const html = '<a href="https://www.chordtela.com/2020/05/chord-dewa-kangen.html">Chord Dewa Kangen</a><a href="https://www.chordtela.com/daftar-isi">Daftar Isi</a>'
  const results = parseChordSearchResults(html)
  assert.equal(results.length, 1)
  assert.equal(results[0].url, 'https://www.chordtela.com/2020/05/chord-dewa-kangen.html')
  const text = extractChordText('<html><body><pre>Intro: C Am\nVerse lirik lagu di sini</pre></body></html>')
  assert.ok(text.includes('Intro: C Am'))
  const withSidebar =
    '<div class="sidebar"><div class="widget"><a href="https://www.chordtela.com/2026/10/lagu-sidebar.html">Chord Sidebar</a></div></div>'
  assert.deepEqual(parseChordSearchResults(withSidebar), [])
})

test('extractMediafireDownload dan extractDriveFileId', () => {
  const parsed = extractMediafireDownload('<a id="downloadButton" href="https://download.mediafire.com/abc/file.zip">Download</a>')
  assert.equal(parsed.directUrl, 'https://download.mediafire.com/abc/file.zip')
  assert.equal(extractMediafireDownload('<p>kosong</p>'), null)
  assert.equal(
    extractDriveFileId('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing'),
    '1AbCdEfGhIjKlMnOpQrStUv'
  )
  assert.equal(extractDriveFileId('https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMn'), '1AbCdEfGhIjKlMn')
  assert.equal(extractDriveFileId('https://example.com/nope'), null)
})
