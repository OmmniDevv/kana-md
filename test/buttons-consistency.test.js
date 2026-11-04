import { test } from 'node:test'
import assert from 'node:assert/strict'
import { t as translate, addMessages } from '../src/i18n/index.js'
import { sendButtons } from '../src/ui/buttons.js'
import { i18n as ytsI18n, buildYtsButtons, handler as ytsHandler } from '../plugins/download/yts.js'
import {
  i18n as spotifyI18n,
  buildSpotifyResultButtons,
  buildSpotifyDoneButtons,
  isSpotifyUrl,
  handler as spotifyHandler,
} from '../plugins/download/spotify.js'
import { i18n as playI18n, extractYouTubeUrl, buildPlayButtons } from '../plugins/download/play.js'
import { i18n as pingI18n, handler as pingHandler } from '../plugins/main/ping.js'
import { i18n as langI18n, handler as langHandler } from '../plugins/main/lang.js'

for (const mod of [ytsI18n, spotifyI18n, playI18n, pingI18n, langI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}

const tId = (key, vars) => translate('id', key, vars)

function fakeSock({ withRelay = true } = {}) {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
  }
  if (withRelay) {
    sock.relayMessage = async (jid, message, opts) => {
      relayed.push({ jid, message, opts })
      return {}
    }
  }
  return { sock, sent, relayed }
}

// Kumpulkan id tombol dari payload relay: jalan-jalan di objek pesan,
// parse tiap buttonParamsJson (string JSON) dan ambil field id-nya.
function collectButtonIds(node, out = []) {
  if (!node || typeof node !== 'object') return out
  for (const [key, value] of Object.entries(node)) {
    if (key === 'buttonParamsJson' && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.id) out.push(parsed.id)
      } catch {
        // bukan JSON tombol, abaikan
      }
    } else {
      collectButtonIds(value, out)
    }
  }
  return out
}

const ytResults = [
  { title: 'Lagu Satu', durationText: '3:20', url: 'https://www.youtube.com/watch?v=aaa111' },
  { title: 'Lagu Dua', durationText: '4:05', url: 'https://www.youtube.com/watch?v=bbb222' },
]

const spotifyTracks = [
  { type: 'track', title: 'Song A', artist: 'Artist A', url: 'https://open.spotify.com/track/111aaa' },
  { type: 'track', title: 'Song B', artist: 'Artist B', url: 'https://open.spotify.com/track/222bbb' },
]

test('buildYtsButtons: id per hasil = .play <url>, ditutup .menu download', () => {
  const buttons = buildYtsButtons(ytResults, tId)
  assert.deepEqual(
    buttons.map((b) => b.id),
    ['.play https://www.youtube.com/watch?v=aaa111', '.play https://www.youtube.com/watch?v=bbb222', '.menu download']
  )
  assert.ok(buttons.length <= 10)
  for (const b of buttons) assert.ok(b.text.length > 0 && b.text.length <= 25)
})

test('yts: hasil pencarian terkirim sebagai tombol quick_reply dengan id yang benar', async () => {
  const { sock, relayed } = fakeSock()
  const body = 'Hasil pencarian YouTube buat "lagu":\n1. Lagu Satu (3:20)\n.play https://www.youtube.com/watch?v=aaa111'
  await sendButtons(sock, '628123@s.whatsapp.net', {
    title: 'KANA',
    body,
    footer: tId('menu.footer'),
    replies: buildYtsButtons(ytResults, tId),
    textFallback: body,
  })
  assert.equal(relayed.length, 1, 'satu pesan tombol ter-relay')
  const ids = collectButtonIds(relayed[0].message)
  assert.ok(ids.includes('.play https://www.youtube.com/watch?v=aaa111'), 'id hasil pertama benar')
  assert.ok(ids.includes('.play https://www.youtube.com/watch?v=bbb222'), 'id hasil kedua benar')
  assert.ok(ids.includes('.menu download'), 'ada tombol menu download')
})

test('yts: relayMessage absen, fallback teks tetap terkirim dan tidak gagal', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const body = 'Hasil pencarian YouTube buat "lagu":\n1. Lagu Satu (3:20)\n.play https://www.youtube.com/watch?v=aaa111'
  await sendButtons(sock, '628123@s.whatsapp.net', {
    title: 'KANA',
    body,
    footer: tId('menu.footer'),
    replies: buildYtsButtons(ytResults, tId),
    textFallback: body,
  })
  const texts = sent.map((s) => s.content.text ?? '').join('\n')
  assert.ok(texts.includes(body), 'teks fallback terkirim utuh')
})

test('buildSpotifyResultButtons: id per hasil = .spotify <url track>', () => {
  const buttons = buildSpotifyResultButtons(spotifyTracks, tId)
  assert.deepEqual(
    buttons.map((b) => b.id),
    ['.spotify https://open.spotify.com/track/111aaa', '.spotify https://open.spotify.com/track/222bbb']
  )
})

test('buildSpotifyDoneButtons: hasil + cari ulang + lirik + menu, total maks 10', () => {
  const buttons = buildSpotifyDoneButtons({ input: 'song a', title: 'Song A', results: spotifyTracks }, tId)
  const ids = buttons.map((b) => b.id)
  assert.ok(ids.includes('.spotify https://open.spotify.com/track/111aaa'))
  assert.ok(ids.includes('.spotify song a'), 'ada tombol cari ulang dengan query terakhir')
  assert.ok(ids.includes('.lirik Song A'), 'ada tombol lirik judul lagu')
  assert.ok(ids.includes('.menu download'))
  assert.ok(buttons.length <= 10)
})

test('spotify: hasil pencarian terkirim sebagai tombol quick_reply dengan id yang benar', async () => {
  const { sock, relayed } = fakeSock()
  const body = 'Song A - Artist A\nHasil pencarian Spotify buat "song a":'
  await sendButtons(sock, '628123@s.whatsapp.net', {
    title: 'KANA',
    body,
    footer: tId('menu.footer'),
    replies: buildSpotifyDoneButtons({ input: 'song a', title: 'Song A', results: spotifyTracks }, tId),
    textFallback: body,
  })
  assert.equal(relayed.length, 1, 'satu pesan tombol ter-relay')
  const ids = collectButtonIds(relayed[0].message)
  assert.ok(ids.includes('.spotify https://open.spotify.com/track/111aaa'), 'id track pertama benar')
  assert.ok(ids.includes('.spotify https://open.spotify.com/track/222bbb'), 'id track kedua benar')
  assert.ok(ids.includes('.lirik Song A'))
  assert.ok(ids.includes('.menu download'))
})

test('spotify: relayMessage absen, fallback teks tetap terkirim dan tidak gagal', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const body = 'Song A - Artist A\nLanjutan: .spotify song a • .lirik Song A • .menu download'
  await sendButtons(sock, '628123@s.whatsapp.net', {
    title: 'KANA',
    body,
    footer: tId('menu.footer'),
    replies: buildSpotifyDoneButtons({ input: 'song a', title: 'Song A', results: spotifyTracks }, tId),
    textFallback: body,
  })
  const texts = sent.map((s) => s.content.text ?? '').join('\n')
  assert.ok(texts.includes(body), 'teks fallback terkirim utuh')
})

test('isSpotifyUrl: kenali URL track, tolak judul lagu biasa', () => {
  assert.equal(isSpotifyUrl('https://open.spotify.com/track/111aaa'), true)
  assert.equal(isSpotifyUrl('Hati-Hati di Jalan'), false)
})

test('extractYouTubeUrl play: kenali watch dan youtu.be, tolak judul', () => {
  assert.equal(extractYouTubeUrl('https://www.youtube.com/watch?v=abc123'), 'https://www.youtube.com/watch?v=abc123')
  assert.equal(extractYouTubeUrl('putar https://youtu.be/abc123 dong'), 'https://youtu.be/abc123')
  assert.equal(extractYouTubeUrl('Dewa 19 Kangen'), null)
})

test('buildPlayButtons: .yts judul, .ytmp4 url, .menu download', () => {
  const buttons = buildPlayButtons({ title: 'Kangen', url: 'https://youtu.be/abc123' }, tId)
  assert.deepEqual(
    buttons.map((b) => b.id),
    ['.yts Kangen', '.ytmp4 https://youtu.be/abc123', '.menu download']
  )
})

// Jalur handler tanpa jaringan: query kosong berhenti di penjaga sebelum
// scraper dipanggil, jadi aman diuji offline.
test('handler yts query kosong: minta kata kunci, tanpa tombol dan tanpa jaringan', async () => {
  const { sock, relayed } = fakeSock()
  const replies = []
  const ctx = {
    sock,
    chat: '628123@s.whatsapp.net',
    text: '   ',
    t: tId,
    reply: async (txt) => replies.push(txt),
  }
  await ytsHandler(ctx)
  assert.equal(replies.length, 1)
  assert.match(replies[0], /kata kuncinya dulu/)
  assert.equal(relayed.length, 0)
})

test('handler spotify query kosong: minta judul, tanpa tombol dan tanpa jaringan', async () => {
  const { sock, relayed } = fakeSock()
  const replies = []
  const ctx = {
    sock,
    chat: '628123@s.whatsapp.net',
    text: '',
    t: tId,
    say: () => '~',
    reply: async (txt) => replies.push(txt),
  }
  await spotifyHandler(ctx)
  assert.equal(replies.length, 1)
  assert.match(replies[0], /judul lagunya dulu/)
  assert.equal(relayed.length, 0)
})

// Handler ping dan lang tidak menyentuh jaringan: uji tombolnya langsung.
function baseCtx(sock, extra = {}) {
  return {
    sock,
    chat: '628123@s.whatsapp.net',
    raw: { messageTimestamp: Math.floor(Date.now() / 1000) },
    lang: 'id',
    args: [],
    text: '',
    sender: '628123@s.whatsapp.net',
    t: tId,
    say: () => '~',
    reply: async () => {},
    storage: { set: async () => {}, get: async () => undefined },
    ...extra,
  }
}

test('handler ping: pong terkirim dengan tombol .menu, .help, .profil', async () => {
  const { sock, relayed } = fakeSock()
  await pingHandler(baseCtx(sock))
  assert.equal(relayed.length, 1)
  const ids = collectButtonIds(relayed[0].message)
  assert.deepEqual(ids, ['.menu', '.help', '.profil'])
})

test('handler ping tanpa relay: fallback teks pong tetap terkirim', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  await pingHandler(baseCtx(sock))
  const texts = sent.map((s) => s.content.text ?? '').join('\n')
  assert.match(texts, /Pong~/)
})

test('handler lang sesudah ganti bahasa: tombol .menu dan .help terkirim', async () => {
  const { sock, relayed } = fakeSock()
  const stored = []
  const ctx = baseCtx(sock, {
    args: ['en'],
    storage: {
      set: async (ns, key, value) => stored.push([ns, key, value]),
      get: async () => undefined,
    },
  })
  await langHandler(ctx)
  assert.deepEqual(stored, [['users', '628123:lang', 'en']])
  assert.equal(relayed.length, 1)
  const ids = collectButtonIds(relayed[0].message)
  assert.deepEqual(ids, ['.menu', '.help'])
})
