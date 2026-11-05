import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractVideyId, videyFileUrl, downloadVidey } from '../src/scrapers/download/videy.js'
import { handler as videyHandler } from '../plugins/download/videy.js'

test('videy: ekstrak id dari tautan tonton videy', () => {
  assert.equal(extractVideyId('https://videy.co/v/?id=JrNCwEbD1'), 'JrNCwEbD1')
  assert.equal(extractVideyId('https://videy.co/v?id=JrNCwEbD1'), 'JrNCwEbD1')
  assert.equal(extractVideyId('https://videy.co/'), null)
  assert.equal(extractVideyId('https://videy.co/v/?id='), null)
  assert.equal(extractVideyId('https://youtube.com/watch?v=JrNCwEbD1'), null)
  assert.equal(extractVideyId('bukan url'), null)
})

test('videy: URL berkas CDN mengikuti pola resmi', () => {
  assert.equal(videyFileUrl('JrNCwEbD1'), 'https://cdn.videy.co/JrNCwEbD1.mp4')
})

const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.alloc(64, 3)])

test('videy: downloadVidey mengunduh dari URL CDN dan memvalidasi MP4', async () => {
  const seen = []
  const download = async (url) => { seen.push(url); return { buffer: MP4 } }
  const out = await downloadVidey('https://videy.co/v/?id=JrNCwEbD1', { download })
  assert.deepEqual(seen, ['https://cdn.videy.co/JrNCwEbD1.mp4'])
  assert.equal(out.id, 'JrNCwEbD1')
  assert.equal(out.buffer, MP4)
})

test('videy: downloadVidey menolak tautan asing dan berkas bukan MP4', async () => {
  await assert.rejects(() => downloadVidey('https://example.com/v?id=abcdef', { download: async () => ({ buffer: MP4 }) }), /tidak valid/)
  await assert.rejects(
    () => downloadVidey('https://videy.co/v/?id=JrNCwEbD1', { download: async () => ({ buffer: Buffer.from('<html>nope</html>') }) }),
    /bukan video MP4/,
  )
  await assert.rejects(
    () => downloadVidey('https://videy.co/v/?id=JrNCwEbD1', { download: async () => { throw new Error('Unduh gagal: HTTP 404') } }),
    /tidak ditemukan/,
  )
})

test('videy: handler mengirim video hasil unduhan, gagal dengan jujur', async () => {
  const sent = []
  const replies = []
  const base = {
    chat: '123@s.whatsapp.net',
    raw: { key: { id: 'RAW1' } },
    sock: { sendMessage: async (chat, payload) => { sent.push(payload); return { key: { id: 'S1' } } } },
    t: (k) => k,
    say: () => '',
    reply: async (txt) => { replies.push(txt) },
  }
  await videyHandler({ ...base, text: 'https://videy.co/v/?id=JrNCwEbD1' }, { fetchVideo: async () => ({ id: 'JrNCwEbD1', buffer: MP4 }) })
  assert.equal(sent.length, 1)
  assert.equal(sent[0].video, MP4)
  await videyHandler({ ...base, text: 'https://videy.co/v/?id=JrNCwEbD1' }, { fetchVideo: async () => { throw new Error('video tidak ditemukan di videy (sudah dihapus?)') } })
  assert.match(replies.at(-1), /videy\.fail/)
  const before = replies.length
  await videyHandler({ ...base, text: '' }, { fetchVideo: async () => { throw new Error('tidak boleh dipanggil') } })
  assert.equal(replies.length, before + 1)
  assert.match(replies.at(-1), /videy\.hint/)
})
