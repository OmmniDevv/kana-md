import { test } from 'node:test'
import assert from 'node:assert/strict'
import { textImage, wrapText } from '../src/services/text-image.js'

test('wrapText memecah kata panjang dan baris lebar', () => {
  assert.deepEqual(wrapText('satu dua tiga empat', 9), ['satu dua', 'tiga', 'empat'])
  assert.deepEqual(wrapText('abcdefghij', 4), ['abcd', 'efgh', 'ij'])
})

test('textImage menghasilkan buffer PNG valid', async () => {
  const buffer = await textImage({
    width: 240,
    height: 120,
    lines: [{ text: 'Halo KANA', size: 24, bold: true }],
  })
  assert.ok(Buffer.isBuffer(buffer))
  assert.deepEqual([...buffer.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47])
})
