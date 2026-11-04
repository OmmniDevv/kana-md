import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickJoke } from '../plugins/fun/joke.js'
import { JOKES } from '../src/data/fun.js'

test('joke: dataset punya minimal 10 lelucon dwibahasa', () => {
  assert.ok(JOKES.length >= 10)
  for (const j of JOKES) {
    assert.ok(j.id && j.en)
  }
})

test('joke: pickJoke memilih dari dataset sesuai bahasa', () => {
  assert.equal(pickJoke('id', () => 0), JOKES[0].id)
  assert.equal(pickJoke('en', () => 0), JOKES[0].en)
  assert.equal(pickJoke('id', () => 0.999), JOKES[JOKES.length - 1].id)
})
