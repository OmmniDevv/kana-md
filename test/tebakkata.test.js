import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { TEXT_SETS } from '../src/data/quiz.js'
import { startQuiz, answerQuiz, getSession } from '../src/quiz/engine.js'

const CHAT = '120363999@g.us'
const DIGITS = '628111222333'
const rng0 = () => 0

test('tebakkata: set data lengkap dua bahasa', () => {
  const set = TEXT_SETS.tebakkata
  assert.ok(Array.isArray(set), 'TEXT_SETS.tebakkata harus ada')
  assert.ok(set.length >= 15)
  for (const item of set) {
    assert.ok(item.q.id && item.q.en, 'petunjuk dua bahasa')
    assert.ok(item.a.id && item.a.en, 'jawaban dua bahasa')
  }
})

test('tebakkata: engine bisa memulai sesi dan menilai jawaban (regresi jenis tidak dikenal)', async () => {
  const storage = memoryStorage()
  const { session, question } = await startQuiz(storage, CHAT, 'tebakkata', { lang: 'id', rng: rng0, now: 1000000 })
  assert.equal(session.type, 'tebakkata')
  assert.equal(question.text, TEXT_SETS.tebakkata[0].q.id)
  assert.equal(session.question, TEXT_SETS.tebakkata[0].q.id)
  assert.equal(session.answerText, TEXT_SETS.tebakkata[0].a.id)
  const wrong = await answerQuiz(storage, CHAT, DIGITS, 'jawaban ngawur sekali', { now: 1000001 })
  assert.equal(wrong.correct, false)
  const right = await answerQuiz(storage, CHAT, DIGITS, TEXT_SETS.tebakkata[0].a.id.toLowerCase(), { now: 1000002 })
  assert.equal(right.correct, true)
  assert.equal(right.finished, true)
  assert.equal(await getSession(storage, CHAT, 1000003), null)
})
