import { test } from 'node:test'
import assert from 'node:assert/strict'
import jpeg from 'jpeg-js'
import {
  FAKE_TROLI_TOKEN,
  buildFakeContactQuoted,
  buildFakeTroliQuoted,
  coverJpeg300,
  sendQuotedText,
} from '../src/ui/fake-thumb.js'

function patternedJpeg(width, height, quality = 90) {
  const data = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      data[i] = Math.floor((x / Math.max(1, width - 1)) * 255)
      data[i + 1] = Math.floor((y / Math.max(1, height - 1)) * 255)
      data[i + 2] = 90
      data[i + 3] = 255
    }
  }
  return Buffer.from(jpeg.encode({ data, width, height }, quality).data)
}

test('coverJpeg300: JPEG melebar menjadi sampul persegi 300x300', () => {
  const small = coverJpeg300(patternedJpeg(640, 320), 80)
  const decoded = jpeg.decode(small, { useTArray: true })
  assert.equal(decoded.width, 300)
  assert.equal(decoded.height, 300)
  assert.ok(small.length > 0)
})

test('coverJpeg300: buffer rusak dan non-buffer dikembalikan apa adanya', () => {
  const rusak = Buffer.from('bukan jpeg')
  assert.equal(coverJpeg300(rusak), rusak)
  assert.equal(coverJpeg300(null), null)
})

test('buildFakeContactQuoted: fake contact menu utama ala SC owner', () => {
  const quoted = buildFakeContactQuoted({ botName: 'KANA' })
  assert.deepEqual(quoted.key, {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
  })
  assert.equal(quoted.message.contactMessage.displayName, 'KANA')
  assert.match(quoted.message.contactMessage.vcard, /FN:KANA/)
  assert.equal(quoted.message.contactMessage.sendEphemeral, true)
  assert.ok(!JSON.stringify(quoted).includes('Newsletter'))
})

test('buildFakeTroliQuoted: fake orderMessage lengkap dengan thumbnail dan itemCount', () => {
  const thumbnail = Buffer.from('jpeg-300')
  const quoted = buildFakeTroliQuoted({
    botName: 'KANA',
    botNumber: '6285187605007',
    itemCount: 312,
    thumbnail,
  })
  assert.deepEqual(quoted.key, {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
  })
  const order = quoted.message.orderMessage
  assert.equal(order.orderId, '1337')
  assert.equal(order.thumbnail, thumbnail)
  assert.equal(order.itemCount, 312)
  assert.equal(order.status, 'INQUIRY')
  assert.equal(order.surface, 'CATALOG')
  assert.equal(order.message, 'KANA - 312 Commands')
  assert.equal(order.orderTitle, '📋 312 Commands')
  assert.equal(order.sellerJid, '6285187605007@s.whatsapp.net')
  assert.equal(order.token, FAKE_TROLI_TOKEN)
  assert.equal(order.totalAmount1000, 0)
  assert.equal(order.totalCurrencyCode, 'IDR')
  assert.deepEqual(order.contextInfo, { isForwarded: true, forwardingScore: 9999 })
})

test('sendQuotedText: satu panggilan sendMessage dengan contextInfo dan quoted', async () => {
  const calls = []
  const sock = {
    sendMessage: async (jid, content, opts) => {
      calls.push({ jid, content, opts })
      return { ok: true }
    },
  }
  const quoted = buildFakeTroliQuoted({ botName: 'KANA', itemCount: 3 })
  const contextInfo = { mentionedJid: ['6281@s.whatsapp.net'], forwardingScore: 9, isForwarded: true }
  await sendQuotedText(sock, '6281@s.whatsapp.net', 'isi menu', { quoted, contextInfo })
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].content, { text: 'isi menu', contextInfo })
  assert.equal(calls[0].opts.quoted, quoted)
})
