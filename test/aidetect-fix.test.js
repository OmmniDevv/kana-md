import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detectAiImage } from '../plugins/ai/aidetect.js'

const img = Buffer.alloc(2048, 7)

test('aidetect: payload success:false dicoba ulang lalu hasil asli dikembalikan', async () => {
  let calls = 0
  const postImpl = async () => {
    calls += 1
    if (calls === 1) return { success: false, code: 500, message: 'Unable to verify content moderation. Please try again.', data: null }
    return { success: true, code: 200, data: { result: 4.2, result_details: { final_result: 'Real' } } }
  }
  const data = await detectAiImage(img, 'image.jpg', 'image/jpeg', { postImpl })
  assert.equal(calls, 2)
  assert.equal(data.success, true)
  assert.equal(data.data.result_details.final_result, 'Real')
})

test('aidetect: success:false terus menerus dilempar sebagai error layanan', async () => {
  let calls = 0
  const postImpl = async () => {
    calls += 1
    return { success: false, code: 500, message: 'Unable to verify content moderation. Please try again.', data: null }
  }
  await assert.rejects(
    () => detectAiImage(img, 'image.jpg', 'image/jpeg', { postImpl }),
    /Unable to verify content moderation/,
  )
  assert.equal(calls, 2)
})

test('aidetect: error jaringan juga dicoba ulang sesuai batas attempts', async () => {
  let calls = 0
  const postImpl = async () => {
    calls += 1
    throw new Error('socket hang up')
  }
  await assert.rejects(
    () => detectAiImage(img, 'image.jpg', 'image/jpeg', { postImpl, attempts: 3 }),
    /socket hang up/,
  )
  assert.equal(calls, 3)
})

test('aidetect: berkas terlalu kecil ditolak sebelum panggilan layanan', async () => {
  let calls = 0
  const postImpl = async () => { calls += 1; return { success: true } }
  await assert.rejects(
    () => detectAiImage(Buffer.alloc(100), 'image.jpg', 'image/jpeg', { postImpl }),
    /terlalu kecil/,
  )
  assert.equal(calls, 0)
})
