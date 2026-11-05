import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handler as cekipHandler } from '../plugins/search/cekip.js'
import { extractEmbedMedia } from '../src/scrapers/instagram/instagram.js'

// Regresi sapuan live P11 + CLEANUP (2026-11-05): cekip memakai
// ip-api.com lewat Node fetch yang menggantung dari VM bot sampai
// timeout (curl sehat). Sumber diganti ipwho.is (HTTPS, menjawab
// ~1 detik). Pemetaan bidangnya dikunci tes ini.

const IPWHO = {
  success: true, ip: '8.8.8.8', country: 'United States', country_code: 'US',
  region: 'Virginia', city: 'Ashburn',
  connection: { isp: 'Google LLC', org: 'Google Public DNS' },
  timezone: { id: 'America/New_York' },
}

function fakeCtx(text) {
  const replies = []
  return {
    replies,
    text,
    t: (key, vars = {}) => `${key} ${JSON.stringify(vars)}`,
    say: () => '',
    reply: async (txt) => { replies.push(txt) },
  }
}

test('cekip: memetakan jawaban ipwho.is ke badan balasan', async () => {
  const ctx = fakeCtx('8.8.8.8')
  await cekipHandler(ctx, { fetchInfo: async () => IPWHO })
  assert.equal(ctx.replies.length, 1)
  assert.match(ctx.replies[0], /cekip\.body/)
  assert.match(ctx.replies[0], /"query":"8\.8\.8\.8"/)
  assert.match(ctx.replies[0], /"country":"United States"/)
  assert.match(ctx.replies[0], /"code":"US"/)
  assert.match(ctx.replies[0], /"isp":"Google LLC"/)
  assert.match(ctx.replies[0], /"tz":"America\/New_York"/)
})

test('cekip: IP tidak valid dari sumber -> balasan gagal jujur', async () => {
  const ctx = fakeCtx('999.1.1.1')
  await cekipHandler(ctx, { fetchInfo: async () => ({ success: false }) })
  assert.match(ctx.replies[0], /cekip\.fail/)
})

const EMBED_HTML = String.raw`<html><head><meta property="og:title" content="Video oleh @uji"></head><body><script>{"x":{\"video_url\":\"https:\\/\\/scontent.cdninstagram.com\\/v\\/abc.mp4?_nc_cat=1\u0026_nc_sid=2\",\"display_url\":\"https:\\/\\/scontent.cdninstagram.com\\/v\\/abc.jpg\"}}</script></body></html>`

test('ig embed: ekstrak video_url dari JSON ter-escape dua lapis', () => {
  const media = extractEmbedMedia(EMBED_HTML)
  assert.equal(media.type, 'video')
  assert.equal(media.downloads[0].url, 'https://scontent.cdninstagram.com/v/abc.mp4?_nc_cat=1&_nc_sid=2')
  assert.equal(media.thumbnail, 'https://scontent.cdninstagram.com/v/abc.jpg')
  assert.equal(extractEmbedMedia('<html>tanpa media</html>'), null)
  assert.equal(extractEmbedMedia(''), null)
})
