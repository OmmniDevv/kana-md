import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPlugins } from '../src/core/plugin-loader.js'
import { parseMalRanking, parseMalCards, parseMalCharacters } from '../src/scrapers/kindb/mal.js'
import { parseKusonime, parseKomikindo, parseTokusatsu } from '../src/scrapers/kindb/wp-sites.js'
import { parseFdroidApps } from '../src/scrapers/kindb/fdroid.js'
import { normalizeKodepos } from '../src/scrapers/kindb/kodepos.js'
import { normalizeOmdb } from '../src/scrapers/kindb/omdb.js'
import { normalizeRobloxUser } from '../src/scrapers/kindb/roblox.js'
import { parseTiktokProfile, parseYoutubeChannel } from '../src/scrapers/kindb/social.js'
import { parseDongengList, parseDongengStory } from '../src/scrapers/kindb/dongeng.js'
import { parseLcSchedule } from '../src/scrapers/kindb/lc-schedule.js'
import { findCallingCode, EXPEDITIONS } from '../src/data/kindb-local.js'
import { findMlHero, searchDataset, HOK_HEROES, WUWA_RESONATORS, BA_STUDENTS } from '../src/data/kindb-games.js'
import { makePresets } from '../plugins/tools/preset.js'
import { isGzip, formatSize } from '../plugins/tools/npmdl.js'

const here = dirname(fileURLToPath(import.meta.url))

test('MAL ranking: parse baris topanime dari fixture struktur asli', () => {
  // Struktur nyata topanime.php: tautan gambar tanpa teks mendahului tautan
  // judul di h3, skor di span.text pada div pembungkus.
  const html = `<table><tr class="ranking-list">
    <td class="rank ac"><span class="lightLink top-anime-rank-text rank1">1</span></td>
    <td class="title al va-t word-break">
      <a class="hoverinfo_trigger fl-l" href="https://myanimelist.net/anime/52991/Sousou_no_Frieren"><img data-src="https://cdn.myanimelist.net/x.jpg" /></a>
      <div class="detail"><h3 class="anime_ranking_h3"><a href="https://myanimelist.net/anime/52991/Sousou_no_Frieren" class="hoverinfo_trigger">Sousou no Frieren</a></h3></div>
    </td>
    <td class="score ac fs14"><div class="js-top-ranking-score-col"><span class="text on score-label score-9">9.24</span></div></td></tr>
    <tr class="ranking-list">
    <td class="rank ac"><span class="lightLink top-anime-rank-text rank2">2</span></td>
    <td class="title al va-t word-break">
      <a class="hoverinfo_trigger fl-l" href="https://myanimelist.net/anime/5114/Fullmetal"><img data-src="https://cdn.myanimelist.net/y.jpg" /></a>
      <div class="detail"><h3 class="anime_ranking_h3"><a href="https://myanimelist.net/anime/5114/Fullmetal" class="hoverinfo_trigger">Fullmetal Alchemist: Brotherhood</a></h3></div>
    </td>
    <td class="score ac fs14"><div class="js-top-ranking-score-col"><span class="text on score-label score-9">9.10</span></div></td></tr></table>`
  const rows = parseMalRanking(html, 10)
  assert.equal(rows.length, 2)
  assert.equal(rows[0].title, 'Sousou no Frieren')
  assert.equal(rows[0].rank, 1)
  assert.equal(rows[0].score, 9.24)
  assert.equal(rows[1].title, 'Fullmetal Alchemist: Brotherhood')
})

test('MAL cards: parse kartu musim/genre dari fixture struktur asli', () => {
  const html = `<div class="seasonal-anime"><h2><a class="link-title" href="https://myanimelist.net/anime/61987/X">Kusuriya no Hitorigoto 3rd Season</a></h2>
    <span class="score">8.63</span><div class="genres"><span class="genre"><a>Drama</a></span></div></div>`
  const rows = parseMalCards(html, 10)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].score, 8.63)
  assert.deepEqual(rows[0].genres, ['Drama'])
})

test('MAL characters: parse tautan karakter unik', () => {
  const html = `<a href="https://myanimelist.net/character/40/Luffy_Monkey_D">Monkey D., Luffy</a>
    <a href="https://myanimelist.net/character/40/Luffy_Monkey_D">Monkey D., Luffy</a>
    <a href="https://myanimelist.net/character/62/Zoro">Roronoa, Zoro</a>`
  const rows = parseMalCharacters(html, 8)
  assert.equal(rows.length, 2)
  assert.match(rows[0].name, /Luffy/)
})

test('WP sites: kusonime, komikindo, tokusatsuindo parse hasil asli', () => {
  const kuso = parseKusonime(`<h2><a href="https://kusonime.com/naruto-batch-subtitle-indonesia/">Naruto Batch Subtitle Indonesia</a></h2>`)
  assert.equal(kuso[0].title, 'Naruto Batch Subtitle Indonesia')
  const komik = parseKomikindo(`<div class="animepost"><a href="https://komikindo.ch/komik/solo-leveling/"><span class="tt">Solo Leveling</span></a></div>`)
  assert.equal(komik[0].title, 'Solo Leveling')
  const toku = parseTokusatsu(`<article><h2><a href="https://www.tokusatsuindo.com/kamen-rider-geats-episode-1/" title="Kamen Rider Geats Episode 1">Kamen Rider Geats Episode 1</a></h2></article>`)
  assert.equal(toku.length, 1)
  assert.match(toku[0].title, /Kamen Rider Geats/)
})

test('F-Droid, kodepos, OMDb, Roblox: normalisasi data asli', () => {
  const apps = parseFdroidApps({ apps: [{ name: 'Fennec F-Droid', summary: 'Browse the web', url: 'https://f-droid.org/en/packages/org.mozilla.fennec_fdroid' }] })
  assert.equal(apps[0].id, 'org.mozilla.fennec_fdroid')
  const pos = normalizeKodepos({ data: [{ code: 40375, village: 'Manggahang', district: 'Baleendah', regency: 'Bandung', province: 'Jawa Barat', timezone: 'WIB' }] })
  assert.equal(pos[0].code, 40375)
  assert.equal(pos[0].district, 'Baleendah')
  const film = normalizeOmdb({ Title: 'Inception', Year: '2010', Genre: 'Sci-Fi', Runtime: '148 min', Director: 'Christopher Nolan', Actors: 'Leonardo DiCaprio', Plot: 'A thief...', imdbRating: '8.8', Type: 'movie', Poster: 'https://x/y.jpg', imdbID: 'tt1375666' })
  assert.equal(film.rating, '8.8')
  assert.equal(film.url, 'https://www.imdb.com/title/tt1375666/')
  const rb = normalizeRobloxUser({ id: 1, name: 'builderman', displayName: 'builderman', description: 'Welcome', created: '2006-03-08T00:00:00Z', isBanned: false }, 'https://img/avatar.png')
  assert.equal(rb.url, 'https://www.roblox.com/users/1/profile')
  assert.equal(rb.created, '2006-03-08')
})

test('TikTok dan YouTube: parse profil dari JSON tertanam fixture', () => {
  const ttHtml = `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">{"user":{"id":"107955","uniqueId":"tiktok","nickname":"TikTok","verified":true},"stats":{"followerCount":1000,"followingCount":10,"videoCount":300,"heartCount":5000}}</script> __UNIVERSAL_DATA_FOR_REHYDRATION__`
  const tt = parseTiktokProfile(ttHtml, 'tiktok')
  assert.equal(tt.uniqueId, 'tiktok')
  assert.equal(tt.followers, 1000)
  const ytHtml = `<meta property="og:title" content="MrBeast">{"externalId":"UCX6OQ3DkcsbYNE6H8uQQuVA","subscriberCountText":{"accessibility":{"accessibilityData":{"label":"340 million subscribers"}}}}`
  const yt = parseYoutubeChannel(ytHtml, '@MrBeast')
  assert.equal(yt.channelId, 'UCX6OQ3DkcsbYNE6H8uQQuVA')
  assert.equal(yt.url, 'https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA')
})

test('Dongeng: parse daftar dan isi cerita', () => {
  const list = parseDongengList(`<h3 class="post-title entry-title"><a href="https://www.1000dongeng.com/2015/06/si-kancil.html">DONGENG Si KANCIL DAN BUAYA | DONGENG ANAK DUNIA</a></h3>`)
  assert.equal(list.length, 1)
  assert.match(list[0].title, /Kancil dan Buaya/i)
  const story = parseDongengStory(`<h3 class="post-title">Si Kancil dan Buaya</h3><div class="post-body">Unknown - Juni 16, 2015 Facebook Twitter WhatsApp Dongeng si Kancil - Suatu hari Kancil yang cerdik menyeberangi sungai.</div>`)
  assert.match(story.text, /Kancil yang cerdik/)
})

test('LiveChart: parse jadwal struktur sekarang (blok data-anime-item)', () => {
  const html = `<div class="lc-timetable-day lc-today"><div class="lc-timetable-timeslot" data-timestamp="1793868900">
    <span class="lc-time"><time datetime="2026-11-05T00:55:00-08:00" data-timeslot-target="time">12:55 AM</time></span>
    <div class="lc-timetable-anime-block" data-anime-item-id="13795" data-anime-item-romanized-native-title="Chocotto Yabacity">
      <a class="lc-timetable-anime-block__title" title="Chocotto Yabacity">Chocotto Yabacity</a>
      <a class="lc-timetable-anime-block__label" href="/anime/13795/schedules/19909"><strong>EP2</strong> · Streaming (JP) - YT</a>
    </div></div></div>`
  const rows = parseLcSchedule(html, 12)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].title, 'Chocotto Yabacity')
  assert.equal(rows[0].episode, '2')
  assert.equal(rows[0].time, '12:55 AM')
  assert.equal(rows[0].url, 'https://www.livechart.me/anime/13795')
})

test('Dataset lokal: kode telepon, ekspedisi, hero, build, preset', () => {
  assert.deepEqual(findCallingCode('jepang'), [{ name: 'Jepang', code: '81' }])
  assert.ok(findCallingCode('62').some((r) => r.name === 'Indonesia'))
  assert.ok(EXPEDITIONS.some((e) => e.name === 'JNE'))
  const ling = findMlHero('Ling')
  assert.equal(ling.role, 'Assassin')
  assert.equal(ling.build.length, 6)
  assert.ok(searchDataset(HOK_HEROES, 'daji').some((r) => r[0] === 'Daji'))
  assert.ok(searchDataset(WUWA_RESONATORS, 'jiyan').some((r) => r[0] === 'Jiyan'))
  assert.ok(searchDataset(BA_STUDENTS, 'shiroko').some((r) => r[1] === 'Abydos'))
  assert.equal(makePresets('halo').small, 'ʜᴀʟᴏ')
  assert.equal(isGzip(Buffer.from([0x1f, 0x8b, 0x08])), true)
  assert.equal(isGzip(Buffer.from([0x50, 0x4b, 0x03])), false)
  assert.equal(formatSize(2048), '2.0 KB')
})

test('Registry KIND-B: alias kanonis terdaftar dan nama nonaktif hilang', async () => {
  const registry = await loadPlugins(join(here, '..', 'plugins'))
  const names = new Set(registry.list().map((p) => p.config.name))
  for (const n of ['topanime', 'animelatest', 'animeseason', 'animereco', 'rekom-anime', 'character', 'animeinfo', 'animelink', 'animedate', 'animetrailer', 'kusonime', 'komikindo', 'tokusatsu', 'donghua', 'mangalist', 'movie', 'fdroid', 'apksearch', 'kodepos', 'robloxplayer', 'komikdetail', 'mangaread', 'dongeng', 'callingcode', 'ekspedisilist', 'listhero', 'buildml', 'hok', 'wwchar', 'bluearchive-char', 'npmdl', 'npmshield', 'cekidch', 'cektiktok', 'daftartiktok', 'preset']) {
    assert.ok(names.has(n), 'plugin aktif hilang: ' + n)
  }
  for (const n of ['anilist', 'shinigamidetail', 'wuwa', 'manga', 'wallcraft', 'komiksearch', 'news', 'filmget', 'imdb', 'movieku', 'anichin', 'autoanimewinbu', 'kasedaiki', 'mobinime', 'stor', 'toproblox', 'infotourney', 'android1', 'android1-get', 'animeapaini', 'apkcombo', 'apkpure', 'apkzoic', 'brainly', 'bstation', 'carigrup', 'detail', 'dramabox', 'gsmarena', 'mangatoon', 'melolo', 'pddikti', 'sakura', 'spekhp', 'uptodown', 'bandingkan-hp']) {
    assert.ok(!names.has(n), 'plugin nonaktif masih terdaftar: ' + n)
  }
  assert.equal(registry.resolve('imdb')?.config.name, 'movie')
  assert.equal(registry.resolve('filmget')?.config.name, 'movie')
  assert.equal(registry.resolve('anilist')?.config.name, 'anime')
  assert.equal(registry.resolve('news')?.config.name, 'berita')
  assert.equal(registry.resolve('cnbc')?.config.name, 'berita')
  assert.equal(registry.resolve('komiksearch')?.config.name, 'komik')
  assert.equal(registry.resolve('manga')?.config.name, 'komik')
  assert.equal(registry.resolve('wallcraft')?.config.name, 'wallpaper')
  assert.equal(registry.resolve('wuwa')?.config.name, 'wwchar')
  assert.equal(registry.resolve('shinigamidetail')?.config.name, 'komikdetail')
})
