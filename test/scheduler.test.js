import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isOpenAt, wibParts } from '../src/core/scheduler.js'

test('isOpenAt rentang normal dan rentang melewati tengah malam', () => {
  assert.equal(isOpenAt(8 * 60, '07:00', '22:00'), true)
  assert.equal(isOpenAt(23 * 60, '07:00', '22:00'), false)
  assert.equal(isOpenAt(23 * 60, '22:00', '06:00'), true)
  assert.equal(isOpenAt(12 * 60, '22:00', '06:00'), false)
  assert.equal(isOpenAt(12 * 60, '07:00', '07:00'), null)
})

test('wibParts menghasilkan HH:mm dan tanggal', () => {
  const parts = wibParts(new Date('2026-11-04T06:52:00Z'))
  assert.equal(parts.hhmm, '13:52')
  assert.equal(parts.date, '2026-11-04')
  assert.equal(parts.minutes, 13 * 60 + 52)
})
