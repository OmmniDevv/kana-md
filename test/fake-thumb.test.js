import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import jpeg from 'jpeg-js'
import {
  FAKE_TROLI_TOKEN,
  buildFakeContactQuoted,
  buildFakeQuoted,
  buildFakeTroliQuoted,
  cachedContactThumbnail,
  coverJpeg300,
  forwardedContextInfo,
  sendQuotedText,
  vcardPhotoBlock,
  warmFakeContactThumbnail,
} from '../src/ui/fake-thumb.js'

const CONTACT_PHOTO_PATH = join(dirname(fileURLToPath(import.meta.url)), '../assets/fake-contact.jpg')

function vcardPhotoBytes(vcard) {
  const unfolded = vcard.replace(/\n /g, '')
  const m = unfolded.match(/PHOTO;ENCODING=b;TYPE=JPEG:([A-Za-z0-9+/=]+)/)
  return m ? Buffer.from(m[1], 'base64') : null
}

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

test('forwardedContextInfo: selalu isForwarded dengan skor, extra menimpa', () => {
  const ci = forwardedContextInfo()
  assert.equal(ci.isForwarded, true)
  assert.ok(ci.forwardingScore >= 1)
  const custom = forwardedContextInfo({ forwardingScore: 7, mentionedJid: ['1@s.whatsapp.net'] })
  assert.equal(custom.forwardingScore, 7)
  assert.deepEqual(custom.mentionedJid, ['1@s.whatsapp.net'])
})

test('buildFakeQuoted: keluarga fake _allfake terpetakan ke bentuk pesan yang benar', () => {
  const thumb = patternedJpeg(64, 64)
  const kontak = buildFakeQuoted('kontak', { botName: 'KANA', thumbnail: thumb })
  assert.equal(kontak.message.contactMessage.displayName, 'KANA')
  assert.equal(kontak.message.contactMessage.jpegThumbnail, thumb)
  const dok = buildFakeQuoted('dokumen', { botName: 'KANA', thumbnail: thumb })
  assert.equal(dok.message.documentMessage.title, 'KANA')
  assert.equal(dok.message.documentMessage.jpegThumbnail, thumb)
  const toko = buildFakeQuoted('toko', { botName: 'KANA', botNumber: '628123', thumbnail: thumb })
  assert.equal(toko.message.productMessage.product.title, 'KANA')
  assert.equal(toko.message.productMessage.businessOwnerJid, '628123@s.whatsapp.net')
  const grup = buildFakeQuoted('grup', { botName: 'KANA' })
  assert.equal(grup.message.groupInviteMessage.groupName, 'KANA')
  const gif = buildFakeQuoted('gif', { botName: 'KANA' })
  assert.equal(gif.message.videoMessage.gifPlayback, true)
  const lokasi = buildFakeQuoted('lokasi', { botName: 'KANA' })
  assert.equal(lokasi.message.liveLocationMessage.caption, 'KANA')
  const vn = buildFakeQuoted('vn', {})
  assert.equal(vn.message.audioMessage.ptt, true)
  const teks = buildFakeQuoted('teks', { botName: 'KANA' })
  assert.equal(teks.message.extendedTextMessage.text, 'KANA')
  const troli = buildFakeQuoted('troli', { botName: 'KANA', itemCount: 12 })
  assert.equal(troli.message.orderMessage.itemCount, 12)
  assert.equal(buildFakeQuoted('none', {}), null)
  assert.equal(buildFakeQuoted('tidak-ada', {}), null)
})

test('vcardPhotoBlock: base64 dilipat per 75 karakter, baris lanjutan diawali spasi', () => {
  const thumb = patternedJpeg(64, 64)
  const lines = vcardPhotoBlock(thumb).split('\n')
  assert.ok(lines[0].startsWith('PHOTO;ENCODING=b;TYPE=JPEG:'))
  for (const line of lines) assert.ok(line.length <= 75, `baris ${line.length} karakter`)
  for (const line of lines.slice(1)) assert.ok(line.startsWith(' '))
  const b64 = lines
    .map((line, i) => (i === 0 ? line.slice('PHOTO;ENCODING=b;TYPE=JPEG:'.length) : line.slice(1)))
    .join('')
  assert.ok(Buffer.from(b64, 'base64').equals(thumb))
})

test('foto kontak khusus: cache dari assets/fake-contact.jpg masuk jpegThumbnail dan PHOTO vCard', async () => {
  const warmed = await warmFakeContactThumbnail(CONTACT_PHOTO_PATH)
  assert.ok(Buffer.isBuffer(warmed))
  const cached = cachedContactThumbnail()
  assert.ok(Buffer.isBuffer(cached))
  const decoded = jpeg.decode(cached, { useTArray: true })
  assert.equal(decoded.width, 300)
  assert.equal(decoded.height, 300)
  // Cache adalah hasil coverJpeg300 dari aset di disk, bukan banner menu.
  const onDisk = await readFile(CONTACT_PHOTO_PATH)
  assert.ok(cached.equals(coverJpeg300(onDisk)))

  // Pemanggil tanpa thumbnail (menu utama, tombol, referal, pipeline)
  // otomatis memakai foto kontak khusus ini.
  const quoted = buildFakeContactQuoted({ botName: 'KANA' })
  assert.equal(quoted.message.contactMessage.jpegThumbnail, cached)
  assert.match(quoted.message.contactMessage.vcard, /PHOTO;ENCODING=b;TYPE=JPEG:/)
  assert.ok(vcardPhotoBytes(quoted.message.contactMessage.vcard).equals(cached))
})

test('buildFakeContactQuoted: thumbnail eksplisit menang atas cache foto kontak', async () => {
  await warmFakeContactThumbnail(CONTACT_PHOTO_PATH)
  const thumb = patternedJpeg(64, 64)
  const quoted = buildFakeContactQuoted({ botName: 'KANA', thumbnail: thumb })
  assert.equal(quoted.message.contactMessage.jpegThumbnail, thumb)
  assert.ok(vcardPhotoBytes(quoted.message.contactMessage.vcard).equals(thumb))
})
