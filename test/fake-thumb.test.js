import { test } from 'node:test'
import assert from 'node:assert/strict'
import jpeg from 'jpeg-js'
import { fakeThumbContent, sendFakeThumbText, shrinkJpeg } from '../src/ui/fake-thumb.js'

function solidJpeg(width, height, quality = 90) {
  const data = Buffer.alloc(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 30
    data[i + 1] = 180
    data[i + 2] = 90
    data[i + 3] = 255
  }
  return Buffer.from(jpeg.encode({ data, width, height }, quality).data)
}

test('fakeThumbContent: teks + externalAdReply lengkap untuk library', () => {
  const thumb = Buffer.from('jpeg-palsu')
  const content = fakeThumbContent('isi menu', { body: 'Menu lengkap KANA', thumbnail: thumb })
  assert.equal(content.text, 'isi menu')
  assert.equal(content.externalAdReply.title, 'KANA MD')
  assert.equal(content.externalAdReply.body, 'Menu lengkap KANA')
  assert.equal(content.externalAdReply.mediaType, 1)
  assert.equal(content.externalAdReply.thumbnail, thumb)
  assert.match(content.externalAdReply.url, /github\.com\/OmmniDevv\/kana-md/)
})

test('fakeThumbContent: tanpa thumbnail tetap membentuk kartu (url selalu terisi)', () => {
  const content = fakeThumbContent('teks')
  assert.ok(!('thumbnail' in content.externalAdReply))
  assert.ok(content.externalAdReply.url.length > 0, 'url terisi supaya library tidak memakai URL donasi bawaan')
})

test('shrinkJpeg: gambar lebar diperkecil ke lebar maksimum dan tetap JPEG valid', () => {
  const big = solidJpeg(1280, 720)
  const small = shrinkJpeg(big, 320, 65)
  const decoded = jpeg.decode(small, { useTArray: true })
  assert.equal(decoded.width, 320)
  assert.equal(decoded.height, 180)
  assert.ok(small.length < big.length, 'hasil lebih ringan dari sumber')
})

test('shrinkJpeg: gambar kecil dan buffer rusak dibiarkan apa adanya', () => {
  const smallSrc = solidJpeg(200, 100)
  assert.equal(shrinkJpeg(smallSrc, 320), smallSrc)
  const rusak = Buffer.from('bukan jpeg')
  assert.equal(shrinkJpeg(rusak), rusak)
})

test('sendFakeThumbText: satu panggilan sendMessage, quoted diteruskan', async () => {
  const calls = []
  const sock = {
    sendMessage: async (jid, content, opts) => {
      calls.push({ jid, content, opts })
      return { ok: true }
    },
  }
  const thumb = Buffer.from('thumb')
  const quoted = { key: { id: 'abc' } }
  await sendFakeThumbText(sock, '6281@s.whatsapp.net', 'halo menu', { quoted, thumbnail: thumb, body: 'kartu' })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].jid, '6281@s.whatsapp.net')
  assert.equal(calls[0].content.text, 'halo menu')
  assert.equal(calls[0].content.externalAdReply.thumbnail, thumb)
  assert.equal(calls[0].opts.quoted, quoted)
})
