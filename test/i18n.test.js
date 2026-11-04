import { test } from 'node:test'
import assert from 'node:assert/strict'
import { t, addMessages } from '../src/i18n/index.js'

test('fallback en ke id ke kunci', () => {
  addMessages('id', { testns: { onlyId: 'halo id', greet: 'Halo {name}' } })
  // Kunci hanya ada di id, diminta sebagai en: jatuh ke id.
  assert.equal(t('en', 'testns.onlyId'), 'halo id')
  // Kunci tidak ada di mana pun: kembali kunci itu sendiri.
  assert.equal(t('id', 'testns.tidakAda'), 'testns.tidakAda')
  assert.equal(t('en', 'testns.tidakAda'), 'testns.tidakAda')
})

test('interpolasi variabel', () => {
  addMessages('id', { testns: { greet: 'Halo {name}' } })
  addMessages('en', { testns: { greet: 'Hello {name}' } })
  assert.equal(t('id', 'testns.greet', { name: 'Master' }), 'Halo Master')
  assert.equal(t('en', 'testns.greet', { name: 'Master' }), 'Hello Master')
})

test('kunci inti tersedia dua bahasa', () => {
  assert.match(t('id', 'common.error'), /error/i)
  assert.match(t('en', 'common.error'), /wrong/i)
})
