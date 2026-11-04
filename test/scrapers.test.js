import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as cheerio from 'cheerio'
import { assertSafeUrl, withBreaker } from '../src/scrapers/runner.js'
import { formatDuration, mapTrack } from '../src/scrapers/spotify/spotify.js'
import { parseSpotifyEmbed, parseItunesTrack, cleanTitle } from '../src/scrapers/spotify/metadata.js'
import { normalizeVideo, formatSeconds } from '../src/scrapers/youtube/youtube.js'
import { mapPin } from '../src/scrapers/pinterest/pinterest.js'
import { parseComicCards } from '../src/scrapers/komik/komikcast.js'
import { parseFontCards } from '../src/scrapers/font/dafont.js'
import { attestMessage, isRudderConfigured } from '../src/scrapers/ai/rudder.js'

test('formatDuration spotify', () => {
  assert.equal(formatDuration(61000), '1:01')
  assert.equal(formatDuration(3661000), '1:01:01')
  assert.equal(formatDuration(0), null)
  assert.equal(formatDuration('abc'), null)
  assert.equal(formatDuration(null), null)
})

test('mapTrack spotify memisahkan artis dari subtitle', () => {
  const track = mapTrack({ id: 'abc', title: 'Lagu', subtitle: 'Artis · Album', duration_ms: 61000 })
  assert.equal(track.artist, 'Artis')
  assert.equal(track.url, 'https://open.spotify.com/track/abc')
  assert.equal(track.duration, '1:01')
})

test('assertSafeUrl menolak localhost, IP privat, dan skema non http', () => {
  assert.throws(() => assertSafeUrl('http://localhost:3000/x'), /tidak diizinkan/)
  assert.throws(() => assertSafeUrl('http://127.0.0.1/x'), /privat/)
  assert.throws(() => assertSafeUrl('http://192.168.1.10/x'), /privat/)
  assert.throws(() => assertSafeUrl('http://10.0.0.5/x'), /privat/)
  assert.throws(() => assertSafeUrl('http://169.254.1.1/x'), /privat/)
  assert.throws(() => assertSafeUrl('ftp://example.com/x'), /http/)
  assert.throws(() => assertSafeUrl('bukan url'), /tidak valid/)
  assert.equal(assertSafeUrl('https://open.spotify.com/track/abc').hostname, 'open.spotify.com')
})

test('circuit breaker membuka setelah 3 gagal', async () => {
  const key = `test-${Date.now()}`
  for (let i = 0; i < 3; i++) {
    await assert.rejects(() => withBreaker(key, async () => { throw new Error('boom') }), /boom/)
  }
  await assert.rejects(() => withBreaker(key, async () => 'ok'), (err) => err.code === 'SOURCE_DOWN')
})

test('parseSpotifyEmbed membaca __NEXT_DATA__', () => {
  const entity = { name: 'Judul', artists: [{ name: 'Artis' }], audioPreview: { url: 'https://p.scdn.co/x.mp3' } }
  const html = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { state: { data: { entity } } } } })}</script>`
  const meta = parseSpotifyEmbed(html)
  assert.equal(meta.title, 'Judul')
  assert.equal(meta.artist, 'Artis')
  assert.equal(meta.previewUrl, 'https://p.scdn.co/x.mp3')
  assert.equal(parseSpotifyEmbed('<html></html>'), null)
})

test('parseItunesTrack dan cleanTitle', () => {
  const meta = parseItunesTrack({ trackName: 'Lagu (Live)', artistName: 'Artis', previewUrl: 'https://a/x.m4a', collectionName: 'Alb' })
  assert.equal(meta.title, 'Lagu (Live)')
  assert.equal(meta.source, 'itunes')
  assert.equal(cleanTitle('Lagu (Live) [Remix]'), 'Lagu')
})

test('normalizeVideo youtube dari bentuk search', () => {
  const video = normalizeVideo({ videoId: 'id1', title: 'T', author: { name: 'Ch' }, lengthSeconds: 75, video_url: 'https://youtu.be/id1', thumbnails: [{ url: 's' }, { url: 'l' }] }, 1)
  assert.equal(video.duration, 75)
  assert.equal(video.durationText, '1:15')
  assert.equal(video.thumbnail, 'l')
  assert.equal(formatSeconds(3661), '1:01:01')
})

test('mapPin pinterest memilih gambar original', () => {
  const pin = mapPin({ id: '42', title: 'Pin', images: { orig: { url: 'https://i/orig.jpg' }, '236x': { url: 'https://i/s.jpg' } }, pinner: { username: 'u', full_name: 'U' } })
  assert.equal(pin.thumbnail, 'https://i/orig.jpg')
  assert.equal(pin.type, 'image')
  assert.equal(pin.url, 'https://id.pinterest.com/pin/42/')
  assert.equal(pin.downloads[0].quality, 'Original Image')
})

test('parseComicCards komikcast membaca kartu dari fixture HTML', () => {
  const $ = cheerio.load(
    `<li><a href="https://v2.komikcast.ac/index.php?comic=solo-leveling" title="Solo Leveling"><img src="https://img/cover.jpg" alt="Cover Solo Leveling"></a></li>`
  )
  const cards = parseComicCards($)
  assert.equal(cards.length, 1)
  assert.equal(cards[0].slug, 'solo-leveling')
  assert.equal(cards[0].title, 'Solo Leveling')
  assert.equal(cards[0].cover, 'https://img/cover.jpg')
})

test('parseFontCards dafont membaca kartu dari fixture HTML', () => {
  const $ = cheerio.load(
    `<div><a name="123"></a><div class="lv1left dfbg"><span class="highlight">Animo</span> by <a href="/author.php">Author X</a> <a href="/animo.font">Animo</a></div><div class="lv2right">Free 1,234 downloads</div><div class="preview" style="background:url(https://img/p.png)"></div></div>`
  )
  const cards = parseFontCards($)
  assert.equal(cards.length, 1)
  assert.equal(cards[0].title, 'Animo')
  assert.equal(cards[0].slug, 'animo')
  assert.equal(cards[0].downloads, 1234)
  assert.equal(cards[0].downloadUrl, 'https://dl.dafont.com/dl/?f=animo')
})

test('rudder: attestMessage per skema dan konfigurasi dari env', () => {
  assert.equal(attestMessage(0, 42, 'user-1'), 'user-1:42')
  assert.equal(attestMessage(1, 42, 'user-1'), '42|user-1|th')
  assert.equal(attestMessage(2, 42, 'user-1'), 'th.user-1.42.c')
  assert.equal(attestMessage(5, 42, 'ab-cd'), 'abcd#42')
  delete process.env.RUDDER_USER_ID
  delete process.env.RUDDER_COOKIE_C0
  delete process.env.RUDDER_COOKIE_C1
  delete process.env.RUDDER_TH_WHO
  assert.equal(isRudderConfigured(), false)
})
