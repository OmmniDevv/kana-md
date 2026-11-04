import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatRuntime,
  formatSince,
  renderBioTemplate,
  startAutoBio,
  DEFAULT_ON_TEMPLATE,
  DEFAULT_OFF_TEMPLATE,
} from '../src/services/auto-bio.js'

test('formatRuntime: 0 menit, menit saja, jam+menit, hari', () => {
  assert.equal(formatRuntime(0), '0m')
  assert.equal(formatRuntime(59 * 1000), '0m')
  assert.equal(formatRuntime(5 * 60 * 1000), '5m')
  assert.equal(formatRuntime(65 * 60 * 1000), '1j 05m')
  assert.equal(formatRuntime(60 * 60 * 1000), '1j 00m')
  assert.equal(formatRuntime((2 * 1440 + 3 * 60 + 4) * 60 * 1000), '2 hari 3j 04m')
  assert.equal(formatRuntime(-5000), '0m')
})

test('formatSince menghasilkan pola HH:mm', () => {
  const out = formatSince(new Date('2026-11-04T06:47:00Z'))
  assert.match(out, /^\d{2}:\d{2}$/)
})

test('renderBioTemplate mengganti semua placeholder', () => {
  const out = renderBioTemplate('{bot} ON sejak {since}, runtime {runtime}', {
    bot: 'KANA',
    runtime: '5m',
    since: '13:47',
  })
  assert.equal(out, 'KANA ON sejak 13:47, runtime 5m')
})

test('template default moe dan jelas ON/OFF', () => {
  const on = renderBioTemplate(DEFAULT_ON_TEMPLATE, { bot: 'KANA', runtime: '5m', since: '13:47' })
  const off = renderBioTemplate(DEFAULT_OFF_TEMPLATE, { bot: 'KANA', runtime: '5m', since: '13:47' })
  assert.match(on, /KANA lagi ON/)
  assert.match(on, /5m/)
  assert.match(off, /KANA lagi OFF/)
})

test('startAutoBio memanggil updateProfileStatus dan setOff mengganti ke OFF', async () => {
  const calls = []
  const fakeSock = {
    updateProfileStatus: async (text) => {
      calls.push(text)
    },
  }
  const bio = startAutoBio(fakeSock, { botName: 'KANA', intervalMs: 60000, env: {} })
  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(calls.length, 1)
  assert.match(calls[0], /lagi ON/)
  await bio.setOff()
  assert.equal(calls.length, 2)
  assert.match(calls[1], /lagi OFF/)
})

test('startAutoBio menghormati template dari env dan kegagalan bio tidak fatal', async () => {
  const calls = []
  const fakeSock = {
    updateProfileStatus: async (text) => {
      calls.push(text)
      throw new Error('rate limited')
    },
  }
  const bio = startAutoBio(fakeSock, {
    botName: 'KANA',
    intervalMs: 60000,
    env: { BIO_ON_TEMPLATE: '{bot} ON sejak {since}' },
  })
  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(calls.length, 1)
  assert.match(calls[0], /^KANA ON sejak \d{2}:\d{2}$/)
  await bio.setOff()
})
