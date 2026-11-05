import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as pap from '../plugins/search/pap.js'
import * as pin from '../plugins/search/pin.js'
import * as pinvid from '../plugins/search/pinvid.js'
import * as google from '../plugins/search/google.js'
import * as twitterstalk from '../plugins/search/twitterstalk.js'
import * as github from '../plugins/tools/github.js'
import * as checkhost from '../plugins/tools/checkhost.js'
import * as robloxplayer from '../plugins/search/robloxplayer.js'
import { progressiveVideoUrl, mapPin } from '../src/scrapers/pinterest/pinterest.js'

// Renderer i18n sederhana: navigasi i18n.id dengan kunci titik dan
// substitusi {var}, cukup untuk menjalankan handler di tes.
function makeT(plugin) {
  return (key, vars = {}) => {
    let node = plugin.i18n.id
    for (const part of key.split('.')) node = node?.[part]
    assert.equal(typeof node, 'string', `template ${key} harus ada`)
    return node.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`))
  }
}

function makeCtx(plugin, text) {
  const replies = []
  const sent = []
  return {
    replies,
    sent,
    text,
    chat: '6285869074622@s.whatsapp.net',
    raw: { key: { id: 'msg1' } },
    lang: 'id',
    t: makeT(plugin),
    say: () => '',
    sock: {
      async sendMessage(jid, content) {
        sent.push(content)
        return { key: { id: 'fake' } }
      },
    },
    reply: async (replyText) => {
      replies.push(replyText)
      return { key: { id: 'reply' } }
    },
  }
}

const JPEG = { buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 1, 2]) }
const fakeDownload = async () => JPEG

test('pap: envelope { results } dikonsumsi, gambar terkirim dengan caption kategori', async () => {
  const ctx = makeCtx(pap, 'cewe')
  const search = async () => ({ status: true, total: 1, results: [{ image: 'https://i.pinimg.com/736x/a.jpg' }] })
  await pap.handler(ctx, { search, download: fakeDownload })
  assert.equal(ctx.sent.length, 1)
  assert.match(ctx.sent[0].caption, /PAP CEWE/)
  assert.equal(ctx.replies.length, 0)
})

test('pin: envelope { results } dikonsumsi, album terkirim', async () => {
  const ctx = makeCtx(pin, 'kucing')
  const search = async () => ({
    status: true,
    total: 2,
    results: [{ image: 'https://i.pinimg.com/736x/a.jpg' }, { image: 'https://i.pinimg.com/736x/b.jpg' }],
  })
  await pin.handler(ctx, { search, download: fakeDownload })
  assert.equal(ctx.sent.length, 2)
  assert.match(ctx.sent[0].caption, /PINTEREST: kucing/)
  assert.equal(ctx.replies.length, 0)
})

test('pinvid: hasil scope video dikirim sebagai video dengan tautan pin', async () => {
  const ctx = makeCtx(pinvid, 'kucing')
  const search = async () => ({
    status: true,
    total: 1,
    results: [{ video: 'https://v1.pinimg.com/videos/v.mp4', url: 'https://id.pinterest.com/pin/123/', title: 'Kucing lucu' }],
  })
  await pinvid.handler(ctx, { search, download: fakeDownload })
  assert.equal(ctx.sent.length, 1)
  assert.ok(ctx.sent[0].video)
  assert.match(ctx.sent[0].caption, /PINTEREST VIDEO/)
  assert.match(ctx.sent[0].caption, /pinterest\.com\/pin\/123\//)
})

test('google: parser Bing mengurai b_algo dan membuka bungkus /ck/a', () => {
  const html = `<li class="b_algo" data-id><h2><a target="_blank" href="https://www.bing.com/ck/a?!&amp;&amp;p=abc&amp;u=a1aHR0cHM6Ly9wcmVzaWRlbnJpLmdvLmlkLw&amp;ntb=1">Laman Resmi <strong>Presiden</strong> RI</a></h2><div class="b_caption"><p class="b_lineclamp2"><span class="news_dt">19 Okt 2026</span>&nbsp;&#0183;&#32;Laman resmi Presiden Republik Indonesia.</p></div></li>
  <li class="b_algo" data-id><h2><a href="https://id.wikipedia.org/wiki/Prabowo_Subianto">Prabowo Subianto - Wikipedia</a></h2><div class="b_caption"><p class="b_lineclamp2">Presiden Indonesia kedelapan.</p></div></li>`
  const rows = google.parseBingResults(html)
  assert.equal(rows.length, 2)
  assert.equal(rows[0].url, 'https://presidenri.go.id/')
  assert.match(rows[0].title, /Presiden/)
  assert.doesNotMatch(rows[0].snippet, /19 Okt 2026/)
  assert.equal(rows[1].url, 'https://id.wikipedia.org/wiki/Prabowo_Subianto')
})

test('google: halaman anomaly DuckDuckGo terurai kosong (pemicu cadangan)', () => {
  const anomaly = '<html><body><form>anomaly challenge, no result-link here</form></body></html>'
  assert.deepEqual(google.parseDdgLite(anomaly), [])
})

test('twitterstalk: 404 sesaat FxTwitter dicoba ulang sampai profil ketemu', async () => {
  const ctx = makeCtx(twitterstalk, 'elonmusk')
  let calls = 0
  const fetchJson = async () => {
    calls += 1
    if (calls < 3) return null
    return { user: { screen_name: 'elonmusk', name: 'Elon Musk', followers: 241000000, following: 1000, tweets: 60000, joined: 'Tue Jun 02 2009', description: 'bio' } }
  }
  await twitterstalk.handler(ctx, { fetchJson, delay: async () => {} })
  assert.equal(calls, 3)
  assert.match(ctx.replies[0], /Elon Musk/)
})

test('twitterstalk: 404 terus-menerus baru disimpulkan tidak ketemu', async () => {
  const ctx = makeCtx(twitterstalk, 'akunngawur123')
  await twitterstalk.handler(ctx, { fetchJson: async () => null, delay: async () => {} })
  assert.match(ctx.replies[0], /TIDAK KETEMU/)
})

test('github: parser halaman profil publik tanpa API', () => {
  const html = `<span class="p-name vcard-fullname d-block overflow-hidden" itemprop="name"> Abdul Malik </span>
  <span class="p-nickname vcard-username d-block" itemprop="additionalName"> OmmniDevv </span>
  <div class="p-note user-profile-bio" data-bio-text="Im UsE NyArch Linux, btw &gt;_&lt;"><div>x</div></div>
  <a href="https://github.com/OmmniDevv?tab=repositories">Repositories <span title="29" data-view-component="true" class="Counter">29</span></a>
  <a href="https://github.com/OmmniDevv?tab=followers"><span class="text-bold color-fg-default">128</span> followers</a>
  <a href="https://github.com/OmmniDevv?tab=following"><span class="text-bold color-fg-default">12</span> following</a>`
  const p = github.parseGithubProfile(html, 'OmmniDevv')
  assert.equal(p.login, 'OmmniDevv')
  assert.equal(p.name, 'Abdul Malik')
  assert.equal(p.bio, 'Im UsE NyArch Linux, btw >_<')
  assert.equal(p.followers, '128')
  assert.equal(p.following, '12')
  assert.equal(p.repos, '29')
  assert.equal(github.parseGithubProfile('<html><title>Page not found</title></html>', 'zzz'), null)
})

test('pinterest: video hanya dari rendisi progresif MP4, HLS tidak pernah dipilih', () => {
  const hlsOnly = { V_HLSV4: { url: 'https://v1.pinimg.com/videos/iht/hls/x.m3u8' }, V_HLSV3_MOBILE: { url: 'https://v1.pinimg.com/videos/iht/hls/y.m3u8' } }
  assert.equal(progressiveVideoUrl(hlsOnly), null)
  const mixed = { ...hlsOnly, V_EXP7: { url: 'https://v1.pinimg.com/videos/mc/720p/z.mp4' } }
  assert.equal(progressiveVideoUrl(mixed), 'https://v1.pinimg.com/videos/mc/720p/z.mp4')
  const mapped = mapPin({ id: '1', videos: { video_list: hlsOnly }, images: { orig: { url: 'https://i.pinimg.com/a.jpg' } } })
  assert.equal(mapped.video, null)
  assert.equal(mapped.type, 'image')
})

test('checkhost: node null di check-result adalah pending, bukan gagal', () => {
  assert.equal(checkhost.countPendingNodes({ 'a.node': null, 'b.node': [[['OK', 0.05]]] }), 1)
  assert.equal(checkhost.countPendingNodes({ 'a.node': [[['OK', 0.05]]] }), 0)
  assert.equal(checkhost.countPendingNodes(null), 0)
})

test('checkhost: jawaban DoH dinilai dari record A/AAAA', () => {
  assert.equal(checkhost.dohHasAddress({ Answer: [{ type: 1, data: '1.2.3.4' }] }), true)
  assert.equal(checkhost.dohHasAddress({ Answer: [{ type: 5, data: 'alias.example' }] }), false)
  assert.equal(checkhost.dohHasAddress({}), false)
})

test('checkhost: sumber utama 403 jatuh ke cek cadangan dan jujur di catatan', async () => {
  const ctx = makeCtx(checkhost, 'google.com')
  const api = async () => { throw new Error('check-host HTTP 403') }
  const fallback = async () => ([
    { node: 'DNS Google', ok: true, ms: 40, reason: 'timeout' },
    { node: 'DNS Cloudflare', ok: true, ms: 55, reason: 'timeout' },
    { node: 'HTTPS (VM)', ok: true, ms: 90, reason: 'HTTP 200' },
  ])
  await checkhost.handler(ctx, { api, delay: async () => {}, fallback })
  const last = ctx.replies.at(-1)
  assert.match(last, /CHECK HOST: google\.com/)
  assert.match(last, /3\/3 node berhasil/)
  assert.match(last, /cek cadangan/)
})

test('checkhost: jalur utama sehat tidak memakai cadangan', async () => {
  const ctx = makeCtx(checkhost, 'google.com')
  const api = async (path) => {
    if (path.startsWith('/check-ping')) return { request_id: 'abc123' }
    return { 'de1.node.check-host.net': [[['OK', 0.05, '1.2.3.4', 'AS123']]] }
  }
  let fallbackUsed = false
  const fallback = async () => { fallbackUsed = true; return [] }
  await checkhost.handler(ctx, { api, delay: async () => {}, fallback })
  const last = ctx.replies.at(-1)
  assert.match(last, /1\/1 node berhasil/)
  assert.doesNotMatch(last, /cek cadangan/)
  assert.equal(fallbackUsed, false)
})

// Penjaga definisi tes live: expect tiap plugin yang diperbaiki TIDAK
// boleh cocok dengan teks kegagalan/tidak-ketemu/hint plugin itu sendiri
// (akar klasifikasi palsu pada sapuan live: regex menelan teks gagal).
test('definisi tes live tidak menelan teks kegagalan plugin sendiri', () => {
  const dummy = { message: 'HTTP 403', q: 'kucing', user: 'elonmusk', host: 'google.com', kind: 'CEWE' }
  const cases = [
    [pap, ['pap.needKind', 'pap.notFound', 'pap.failed']],
    [pin, ['pin.needQuery', 'pin.notFound', 'pin.failed']],
    [pinvid, ['pinvid.needQuery', 'pinvid.notFound', 'pinvid.failed']],
    [robloxplayer, ['robloxplayer.hint', 'robloxplayer.notfound', 'robloxplayer.fail']],
    [google, ['google.needQuery', 'google.notFound', 'google.failed']],
    [twitterstalk, ['twitterstalk.needUser', 'twitterstalk.notFound', 'twitterstalk.failed']],
    [github, ['github.hint', 'github.notfound', 'github.fail']],
    [checkhost, ['checkhost.needHost', 'checkhost.failed']],
  ]
  for (const [plugin, keys] of cases) {
    const t = makeT(plugin)
    for (const key of keys) {
      const rendered = t(key, dummy)
      assert.ok(!plugin.test.expect.test(rendered), `${plugin.config.name}: expect cocok dengan ${key}: ${rendered.slice(0, 60)}`)
    }
  }
})
