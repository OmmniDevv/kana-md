import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseXnxxSearch, parseXnxxDetail, isXnxxUrl, isMp4Buffer } from '../src/scrapers/xnxx/xnxx.js'
import { parseNekosapi, pickKonachanPost, isSafePost } from '../src/scrapers/nsfw/adult-image.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import * as xnxxsearch from '../plugins/nsfw/xnxxsearch.js'
import * as waifu18 from '../plugins/nsfw/waifu18.js'
import * as hentai from '../plugins/nsfw/hentai.js'
import * as oppai from '../plugins/nsfw/oppai.js'
import * as milf from '../plugins/nsfw/milf.js'
import * as cekkontol from '../plugins/cek/cekkontol.js'
import * as cekmemek from '../plugins/cek/cekmemek.js'
import * as cektt from '../plugins/cek/cektt.js'

// Tes port NSFW premium RYO-YAMADA-MD (perintah owner 2026-11-05).
// Fixture adalah tangkapan asli dari VM pada 2026-11-05: halaman
// pencarian dan halaman video xnxx.com, balasan NekosAPI rating
// explicit, dan post.json Konachan tag oppai. Verifikasi live terpisah
// di hari yang sama: xnxx mp4 magic ftyp, NekosAPI WebP magic RIFF,
// Konachan JPEG magic ffd8.

const here = dirname(fileURLToPath(import.meta.url))
const fixture = (name) => readFile(join(here, 'fixtures', name), 'utf8')

test('xnxx: urai halaman pencarian asli menjadi hasil bersih', async () => {
  const results = parseXnxxSearch(await fixture('xnxx-search.html'))
  assert.ok(results.length >= 8, 'minimal 8 hasil dari fixture')
  assert.equal(results[0].title, 'Amazing anime sex')
  assert.ok(isXnxxUrl(results[0].url))
  assert.match(results[0].duration, /min/)
  assert.equal(results[0].resolution, '720p')
})

test('xnxx: urai halaman video asli menjadi URL mp4 langsung', async () => {
  const detail = parseXnxxDetail(await fixture('xnxx-detail.html'))
  assert.equal(detail.title, 'Amazing anime sex')
  assert.match(detail.videos.low, /^https:\/\/.*\.mp4/)
  assert.match(detail.videos.high, /^https:\/\/.*\.mp4/)
  assert.equal(parseXnxxDetail('<html>kosong</html>'), null)
  assert.equal(isXnxxUrl('https://www.xnxx.com/video-1aba3j69/amazing_anime_sex'), true)
  assert.equal(isXnxxUrl('https://example.com/video-1'), false)
  assert.equal(isXnxxUrl('bukan url'), false)
})

test('xnxx: magic mp4 dikenali dari ftyp', () => {
  assert.equal(isMp4Buffer(Buffer.from([0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d])), true)
  assert.equal(isMp4Buffer(Buffer.from('{"error":true}')), false)
  assert.equal(isMp4Buffer(Buffer.alloc(0)), false)
})

test('gambar dewasa: urai balasan NekosAPI explicit asli', async () => {
  const parsed = parseNekosapi(JSON.parse(await fixture('nekosapi-explicit.json')))
  assert.ok(parsed)
  assert.match(parsed.url, /^https:\/\/cdn\.nekosapi\.com\//)
  assert.equal(parsed.source, 'nekosapi')
  assert.equal(parseNekosapi([{ url: 'https://x/y.jpg', rating: 'safe' }]), null)
  assert.equal(parseNekosapi([]), null)
  assert.equal(parseNekosapi(null), null)
})

test('gambar dewasa: pilih pos Konachan asli yang aman', async () => {
  const posts = JSON.parse(await fixture('konachan-posts.json'))
  const picked = pickKonachanPost(posts)
  assert.ok(picked)
  assert.match(picked.url, /^https:\/\/konachan\.com\//)
  assert.equal(picked.source, 'konachan')
})

test('gambar dewasa: saringan tag berbahaya tidak bisa ditembus', () => {
  assert.equal(isSafePost('breasts nipples uncensored'), true)
  assert.equal(isSafePost('loli naked'), false)
  assert.equal(isSafePost('shota ass'), false)
  assert.equal(isSafePost('some_loli_tag breasts'), false)
  assert.equal(isSafePost('child breasts'), false)
  assert.equal(isSafePost(''), true)
  const posts = [
    { rating: 'e', tags: 'loli naked', jpeg_url: 'https://konachan.com/bad.jpg' },
    { rating: 'e', tags: 'breasts adult', jpeg_url: 'https://konachan.com/good.jpg' },
    { rating: 's', tags: 'breasts', jpeg_url: 'https://konachan.com/safe.jpg' },
  ]
  assert.equal(pickKonachanPost(posts).url, 'https://konachan.com/good.jpg')
  assert.equal(pickKonachanPost([posts[0]]), null)
})

const PORTED = [xnxxsearch, waifu18, hentai, oppai, milf, cekkontol, cekmemek, cektt]

test('semua plugin port NSFW tergating premium', () => {
  for (const plugin of PORTED) {
    assert.equal(plugin.config.premium, true, plugin.config.name + ' harus premium')
    assert.equal(plugin.config.isPrivate, true, plugin.config.name + ' harus khusus chat pribadi')
  }
  assert.ok(waifu18.config.alias.includes('waifunsfw'))
  assert.ok(xnxxsearch.config.alias.includes('xnxx'))
  assert.ok(cektt.config.alias.includes('cekpentil'))
  assert.ok(cekmemek.config.alias.includes('cekmmk'))
})

for (const plugin of PORTED) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

function fakeStorage() {
  const map = new Map()
  return {
    map,
    async get(ns, key) {
      return map.get(ns + ':' + key) ?? null
    },
    async set(ns, key, value) {
      map.set(ns + ':' + key, value)
    },
  }
}

function fakeCtx(overrides = {}) {
  const sent = []
  const replies = []
  const ctx = {
    chat: '6285869074622@s.whatsapp.net',
    senderDigits: '6285869074622',
    args: [],
    text: '',
    storage: fakeStorage(),
    t,
    async reply(text) {
      replies.push(text)
      return text
    },
    sock: {
      async sendMessage(jid, content) {
        sent.push({ jid, content })
        return content
      },
    },
    ...overrides,
  }
  return { ctx, sent, replies }
}

test('xnxxsearch: pemanggil baru kena gerbang 18+, konfirmasi tersimpan', async () => {
  const { ctx, sent, replies } = fakeCtx()
  await xnxxsearch.handler(ctx)
  const gateText = sent.map((s) => s.content?.text ?? '').join('\n') + replies.join('\n')
  assert.match(gateText, /KONTEN DEWASA/)

  const confirm = fakeCtx({ args: ['dewasa'] })
  confirm.ctx.storage = ctx.storage
  await xnxxsearch.handler(confirm.ctx)
  assert.match(confirm.replies.join('\n'), /KONFIRMASI TERSIMPAN/)
  assert.ok(await ctx.storage.get('kv', 'adult18:6285869074622'))

  // Sesudah konfirmasi, gerbang tidak muncul lagi: panggilan polos
  // dijawab petunjuk pemakaian, bukan gerbang 18+.
  const after = fakeCtx()
  after.ctx.storage = ctx.storage
  await xnxxsearch.handler(after.ctx)
  assert.match(after.replies.join('\n'), /XNXXSEARCH/)
  assert.doesNotMatch(after.replies.join('\n'), /KONTEN DEWASA/)
})

test('waifu18: gerbang 18+ yang sama menjaga gambar dewasa', async () => {
  const { ctx, sent } = fakeCtx()
  await waifu18.handler(ctx)
  const gateText = sent.map((s) => s.content?.text ?? '').join('\n')
  assert.match(gateText, /KONTEN DEWASA/)
})

test('cek vulgar: hasil deterministik, memuat nama dan atribut lengkap', async () => {
  assert.deepEqual(cekkontol.cekKontolResult('Budi'), cekkontol.cekKontolResult('Budi'))
  assert.notDeepEqual(cekkontol.cekKontolResult('Budi'), cekkontol.cekKontolResult('Joko'))
  const r = cekkontol.cekKontolResult('Budi')
  assert.ok(r.warna && r.bulu && r.status && r.ukuran >= 10 && r.ukuran <= 24)

  const { ctx, sent } = fakeCtx({ text: 'Budi', args: ['Budi'] })
  await cekkontol.handler(ctx)
  const out = sent.map((s) => s.content?.text ?? '').join('\n')
  assert.match(out, /CEK KONTOL/)
  assert.match(out, /Budi/)
  assert.match(out, /cm/)

  const memek = fakeCtx({ text: 'Sari', args: ['Sari'] })
  await cekmemek.handler(memek.ctx)
  assert.match(memek.sent.map((s) => s.content?.text ?? '').join('\n'), /CEK MEMEK/)

  const tt = fakeCtx({ text: 'Sari', args: ['Sari'] })
  await cektt.handler(tt.ctx)
  assert.match(tt.sent.map((s) => s.content?.text ?? '').join('\n'), /CEK TETEK/)

  const kosong = fakeCtx({ text: '', args: [] })
  await cekkontol.handler(kosong.ctx)
  assert.match(kosong.replies.join('\n'), /CEK KONTOL/)
})
