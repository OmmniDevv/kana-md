import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseKbbiMirrorDefinitions } from '../src/scrapers/search/kbbi.js'
import { parseMalSearchUrls, parseMalDetail } from '../src/scrapers/search/anime.js'
import { parseIgExportMedia, parseInstaloadrMedia } from '../src/scrapers/instagram/instagram.js'

// Fixture ringkas meniru struktur asli yang terverifikasi live
// 2026-11-05: kbbi.web.id menaruh definisi di #d1 dipisah <br><br>;
// MyAnimeList menaruh hasil di tautan /anime/<id>/<slug> dan detail
// di h1.title-name, .score-label, serta span.dark_text berlabel.

const KBBI_HTML = `<html><body><div id="d1"><b>cin&#183;ta</b> <em>a</em> <b>1</b> suka sekali; sayang benar: <em>orang tuaku cukup -- kepada kami;</em> <b>2</b> kasih sekali; terpikat;<br/><b>-- monyet</b> (rasa) kasih ketika masih kanak-kanak;<br/><br/><b>ber&#183;cin&#183;ta</b> <em>v</em> menaruh (rasa) cinta;<br/><br/></div></body></html>`

test('kbbi cermin: parse #d1 menjadi daftar definisi bersih', () => {
  const defs = parseKbbiMirrorDefinitions(KBBI_HTML)
  assert.equal(defs.length, 2)
  assert.match(defs[0], /^cin·ta a 1 suka sekali/)
  assert.match(defs[1], /^ber·cin·ta v menaruh/)
  assert.deepEqual(parseKbbiMirrorDefinitions('<html><body>tidak ada</body></html>'), [])
  assert.deepEqual(parseKbbiMirrorDefinitions(''), [])
})

const MAL_SEARCH_HTML = `<html><body>
<a href="https://myanimelist.net/anime/20/Naruto">Naruto</a>
<a href="https://myanimelist.net/anime/20/Naruto/video">Videos</a>
<a href="https://myanimelist.net/anime/1735/Naruto__Shippuuden">Shippuuden</a>
<a href="https://myanimelist.net/anime/20/Naruto">Naruto lagi</a>
<a href="https://myanimelist.net/manga/11/Naruto">Manga</a>
</body></html>`

test('MAL: URL pencarian unik, turunan dibuang, urutan dijaga', () => {
  assert.deepEqual(parseMalSearchUrls(MAL_SEARCH_HTML, 'anime'), [
    'https://myanimelist.net/anime/20/Naruto',
    'https://myanimelist.net/anime/1735/Naruto__Shippuuden',
  ])
  assert.deepEqual(parseMalSearchUrls(MAL_SEARCH_HTML, 'manga'), ['https://myanimelist.net/manga/11/Naruto'])
})

const MAL_DETAIL_HTML = `<html><head><meta property="og:image" content="https://cdn.myanimelist.net/images/anime/1141/142503.jpg"></head><body>
<h1 class="title-name h1_bold_none"><strong>Naruto</strong></h1>
<div class="score-label score-8">8.03</div>
<div class="spaceit_pad"><span class="dark_text">English:</span> Naruto</div>
<div class="spaceit_pad"><span class="dark_text">Japanese:</span> ナルト</div>
<div class="spaceit_pad"><span class="dark_text">Episodes:</span> 220</div>
<div class="spaceit_pad"><span class="dark_text">Status:</span> Finished Airing</div>
<p itemprop="description">Twelve years ago, a colossal demon fox terrorized the world. [Written by MAL Rewrite]</p>
</body></html>`

// Fixture cadangan Instagram meniru struktur asli yang terverifikasi
// live dari VM pada 2026-11-05 memakai reel uji kanonis plugin .ig
// (DMXCETGSC5i): igexport membalas ok:true dengan media.items berisi
// url fbcdn (berkasnya lolos cek magic bytes ftyp), instaloadr
// membalas items berisi download_url dan media_type mp4.

const IGEXPORT_VIDEO = {
  ok: true,
  source: 7,
  media: {
    shortcode: 'DMXCETGSC5i',
    items: [
      {
        type: 'video',
        url: 'https://instagram.example.net/o1/v/t2/m367/video.mp4?dl=1',
        thumbnailUrl: 'https://instagram.example.net/v/t51/thumb.jpg',
        filename: 'video.mp4',
      },
    ],
  },
}

test('igexport: respons video menjadi bentuk unduhan yang sama dengan SnapSave', () => {
  const media = parseIgExportMedia(IGEXPORT_VIDEO)
  assert.equal(media.type, 'video')
  assert.equal(media.thumbnail, 'https://instagram.example.net/v/t51/thumb.jpg')
  assert.deepEqual(media.downloads, [
    {
      quality: 'HD',
      type: 'video',
      url: 'https://instagram.example.net/o1/v/t2/m367/video.mp4?dl=1',
      thumbnail: 'https://instagram.example.net/v/t51/thumb.jpg',
    },
  ])
})

test('igexport: respons gagal atau kosong menjadi null', () => {
  assert.equal(parseIgExportMedia({ ok: false, message: 'gagal' }), null)
  assert.equal(parseIgExportMedia({ ok: true, media: { items: [] } }), null)
  assert.equal(parseIgExportMedia(null), null)
})

const INSTALOADR_VIDEO = {
  source_url: 'https://www.instagram.com/reel/DMXCETGSC5i/',
  items: [
    {
      media_type: 'mp4',
      download_url: 'https://instagram.example.net/o1/v/t2/m367/video.mp4',
      thumbnail_url: 'https://instagram.example.net/v/t51/thumb.jpg',
      width: 720,
      height: 1280,
    },
    { media_type: 'jpg', download_url: '', thumbnail_url: '' },
  ],
}

test('instaloadr: item mp4 menjadi unduhan video, item tanpa URL dibuang', () => {
  const media = parseInstaloadrMedia(INSTALOADR_VIDEO)
  assert.equal(media.type, 'video')
  assert.equal(media.downloads.length, 1)
  assert.equal(media.downloads[0].type, 'video')
  assert.equal(media.downloads[0].url, 'https://instagram.example.net/o1/v/t2/m367/video.mp4')
  assert.equal(media.thumbnail, 'https://instagram.example.net/v/t51/thumb.jpg')
})

test('instaloadr: respons tanpa item valid menjadi null', () => {
  assert.equal(parseInstaloadrMedia({ items: [] }), null)
  assert.equal(parseInstaloadrMedia({ detail: 'privat' }), null)
  assert.equal(parseInstaloadrMedia(null), null)
})

test('MAL: detail menjadi bentuk ternormalisasi yang sama dengan Jikan', () => {
  const entry = parseMalDetail(MAL_DETAIL_HTML, 'https://myanimelist.net/anime/20/Naruto', 'anime')
  assert.equal(entry.id, 20)
  assert.equal(entry.title, 'Naruto')
  assert.equal(entry.titleJapanese, 'ナルト')
  assert.equal(entry.score, 8.03)
  assert.equal(entry.count, 220)
  assert.equal(entry.status, 'Finished Airing')
  assert.match(entry.synopsis, /colossal demon fox/)
  assert.doesNotMatch(entry.synopsis, /MAL Rewrite/)
  assert.equal(entry.image, 'https://cdn.myanimelist.net/images/anime/1141/142503.jpg')
})
