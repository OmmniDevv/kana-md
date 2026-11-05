import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { normalizeDownloadedMedia } from '../src/ui/media.js'
import { handler as togifHandler } from '../plugins/maker/togif.js'
import { handler as resizeHandler } from '../plugins/maker/resize.js'
import { handler as getexifHandler } from '../plugins/maker/getexif.js'
import { handler as imgstyleHandler } from '../plugins/maker/imgstyle.js'

const run = promisify(execFile)

// Media uji asli dibuat lokal sekali: MP4 1 detik dan PNG 64x64.
let mp4Buf
let pngBuf
before(async () => {
  await run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=duration=1:size=320x240:rate=10', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '/tmp/dlmedia-in.mp4'])
  await run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'color=red:size=64x64', '-frames:v', '1', '/tmp/dlmedia-in.png'])
  const { readFile } = await import('node:fs/promises')
  mp4Buf = await readFile('/tmp/dlmedia-in.mp4')
  pngBuf = await readFile('/tmp/dlmedia-in.png')
})

// Stub ctx meniru kontrak pipeline ASLI: downloadQuoted mengembalikan
// Buffer polos (downloadMediaMessage tipe 'buffer'), bukan {buffer,kind}.
function fakeCtx({ quotedMessage, downloadResult, text = '' }) {
  const sent = []
  const replies = []
  const ctx = {
    chat: '123@s.whatsapp.net',
    raw: { key: { id: 'RAW1' } },
    text,
    quoted: quotedMessage ? { message: quotedMessage } : null,
    downloadQuoted: async () => downloadResult,
    sock: {
      sendMessage: async (chat, payload) => { sent.push(payload); return { key: { id: 'S1' } } },
    },
    t: (k) => k,
    say: () => '',
    reply: async (txt) => { replies.push(txt); return { key: { id: 'R1' } } },
  }
  return { ctx, sent, replies }
}

test('normalize: Buffer polos + kutipan video menjadi kind video', () => {
  const out = normalizeDownloadedMedia(mp4Buf, { videoMessage: {} })
  assert.equal(out.kind, 'video')
  assert.equal(out.buffer, mp4Buf)
})

test('normalize: Buffer polos + kutipan gambar menjadi kind image', () => {
  const out = normalizeDownloadedMedia(pngBuf, { imageMessage: {} })
  assert.equal(out.kind, 'image')
})

test('normalize: bentuk lama {buffer, kind} tetap diterima', () => {
  const out = normalizeDownloadedMedia({ buffer: pngBuf, kind: 'image' }, null)
  assert.equal(out.kind, 'image')
  assert.equal(out.buffer, pngBuf)
})

test('normalize: kosong dan null menjadi null', () => {
  assert.equal(normalizeDownloadedMedia(null, { videoMessage: {} }), null)
  assert.equal(normalizeDownloadedMedia(Buffer.alloc(0), { videoMessage: {} }), null)
  assert.equal(normalizeDownloadedMedia(undefined, null), null)
})

test('togif: video kutipan Buffer polos diproses menjadi MP4 gifPlayback', async () => {
  const { ctx, sent, replies } = fakeCtx({ quotedMessage: { videoMessage: {} }, downloadResult: mp4Buf })
  await togifHandler(ctx)
  assert.equal(replies.length, 0)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].gifPlayback, true)
  assert.ok(Buffer.isBuffer(sent[0].video))
  assert.equal(sent[0].video.subarray(4, 8).toString(), 'ftyp')
})

test('togif: kutipan gambar ditolak dengan pesan butuh video', async () => {
  const { ctx, sent, replies } = fakeCtx({ quotedMessage: { imageMessage: {} }, downloadResult: pngBuf })
  await togifHandler(ctx)
  assert.equal(sent.length, 0)
  assert.match(replies[0], /togif\.need/)
})

test('resize: gambar kutipan Buffer polos diubah ukurannya', async () => {
  const { ctx, sent, replies } = fakeCtx({ quotedMessage: { imageMessage: {} }, downloadResult: pngBuf, text: '32x32' })
  await resizeHandler(ctx)
  assert.equal(sent.length, 1)
  assert.ok(Buffer.isBuffer(sent[0].image))
  assert.equal(sent[0].image.subarray(0, 4).toString('hex'), '89504e47')
  assert.ok(!replies.some((r) => /resize\.need/.test(r)))
})

test('getexif: media kutipan Buffer polos terbaca metadata-nya', async () => {
  const { ctx, replies } = fakeCtx({ quotedMessage: { videoMessage: {} }, downloadResult: mp4Buf })
  await getexifHandler(ctx)
  assert.ok(replies.length >= 1)
  assert.ok(!/getexif\.need/.test(replies[0]))
  assert.match(replies[0], /getexif\.head/)
})

test('imgstyle: gambar kutipan Buffer polos diproses bergaya abu', async () => {
  const { ctx, sent, replies } = fakeCtx({ quotedMessage: { imageMessage: {} }, downloadResult: pngBuf, text: 'abu' })
  await imgstyleHandler(ctx)
  assert.equal(sent.length, 1)
  assert.ok(Buffer.isBuffer(sent[0].image))
  assert.ok(!replies.some((r) => /imgstyle\.need/.test(r)))
})
