import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { getProfile } from '../src/services/user-service.js'
import { QUIZ_SETS, WORD_LIST, FLAGS, ELEMENTS, IMAGE_WORDS } from '../src/data/quiz.js'
import { TRUTHS, DARES, KHODAMS, JOKES } from '../src/data/fun.js'
import { startQuiz, answerQuiz, giveUp, getSession, normalizeAnswer } from '../src/quiz/engine.js'
import * as family100 from '../plugins/fun/family100.js'
import * as jawab from '../plugins/fun/jawab.js'
import * as cekjodoh from '../plugins/fun/cekjodoh.js'
import * as zodiak from '../plugins/fun/zodiak.js'

for (const plugin of [family100, jawab, cekjodoh, zodiak]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n)) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

const CHAT = '120363999@g.us'
const DIGITS = '628111222333'
const rng0 = () => 0

function fakeSock() {
  const sent = []
  const relayed = []
  return {
    sent,
    relayed,
    user: { id: '628999@s.whatsapp.net' },
    async sendMessage(jid, content) {
      sent.push({ jid, content })
      return { key: { id: 'fake' } }
    },
    async relayMessage(jid, message) {
      relayed.push({ jid, message })
      return { key: { id: 'fake-btn' } }
    },
  }
}

function ctxFor({ storage, sock, text = '', chat = CHAT }) {
  return {
    sock,
    chat,
    sender: `${DIGITS}@s.whatsapp.net`,
    senderDigits: DIGITS,
    pushName: 'Penguji',
    isGroup: true,
    isOwner: false,
    isAdmin: false,
    args: [],
    text,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    reply: async (txt) => { sock.sent.push({ jid: chat, content: { text: txt } }) },
    storage,
    raw: { key: { remoteJid: chat, id: 'msg-1' } },
    mentionedJids: [],
  }
}

test('dataset kuis: tiap jenis utama minimal 20 item dan jawaban valid', () => {
  for (const type of ['family100', 'caklontong', 'asahotak', 'tekateki']) {
    assert.ok(QUIZ_SETS[type].length >= 20, `${type} cuma ${QUIZ_SETS[type].length} item`)
  }
  for (const type of ['caklontong', 'asahotak', 'tekateki']) {
    for (const item of QUIZ_SETS[type]) {
      assert.equal(item.options.length, 4, `${type}: opsi harus 4`)
      assert.ok(item.answer >= 0 && item.answer <= 3, `${type}: indeks jawaban di luar opsi`)
      assert.ok(item.q.id && item.q.en, `${type}: soal dwibahasa`)
      for (const opt of item.options) assert.ok(opt.id && opt.en, `${type}: opsi dwibahasa`)
    }
  }
  for (const item of QUIZ_SETS.family100) {
    assert.ok(item.answers.length >= 4, 'family100: minimal 4 jawaban populer')
    for (const a of item.answers) assert.ok(a.points > 0 && a.text.id && a.text.en)
  }
  assert.ok(WORD_LIST.length >= 30)
  assert.ok(FLAGS.length >= 24)
  assert.ok(ELEMENTS.length >= 20)
  assert.ok(IMAGE_WORDS.length >= 10)
})

test('dataset fun: truth, dare, khodam, jokes memenuhi jumlah minimal', () => {
  assert.ok(TRUTHS.length >= 20)
  assert.ok(DARES.length >= 20)
  assert.ok(KHODAMS.length >= 20)
  assert.ok(JOKES.length >= 15)
  for (const k of KHODAMS) assert.ok(k.name.id && k.name.en && k.trait.id && k.trait.en)
})

test('engine: mulai sesi pilihan ganda dan jawab benar memberi poin XP', async () => {
  const storage = memoryStorage()
  const { session, question } = await startQuiz(storage, CHAT, 'tekateki', { lang: 'id', rng: rng0, now: 1000000 })
  assert.equal(session.type, 'tekateki')
  assert.equal(question.options.length, 4)
  const active = await getSession(storage, CHAT, 1000001)
  assert.ok(active)
  const correctText = QUIZ_SETS.tekateki[0].options[QUIZ_SETS.tekateki[0].answer].id
  const result = await answerQuiz(storage, CHAT, DIGITS, correctText, { now: 1000002 })
  assert.equal(result.correct, true)
  assert.equal(result.finished, true)
  assert.equal(result.points, QUIZ_SETS.tekateki[0].points)
  const profile = await getProfile(storage, DIGITS)
  assert.equal(profile.xp, QUIZ_SETS.tekateki[0].points)
  assert.equal(await getSession(storage, CHAT, 1000003), null)
})

test('engine: jawab dengan huruf opsi juga benar', async () => {
  const storage = memoryStorage()
  const { session } = await startQuiz(storage, CHAT, 'asahotak', { lang: 'id', rng: rng0, now: 2000000 })
  const letter = 'ABCD'[session.answerIndex]
  const result = await answerQuiz(storage, CHAT, DIGITS, letter, { now: 2000001 })
  assert.equal(result.correct, true)
  assert.equal(result.finished, true)
})

test('engine: jawab salah tidak mengakhiri sesi dan tidak memberi XP', async () => {
  const storage = memoryStorage()
  await startQuiz(storage, CHAT, 'caklontong', { lang: 'id', rng: rng0, now: 3000000 })
  const result = await answerQuiz(storage, CHAT, DIGITS, 'jawaban ngawur sekali', { now: 3000001 })
  assert.equal(result.correct, false)
  assert.equal(result.finished, false)
  assert.ok(await getSession(storage, CHAT, 3000002))
  const profile = await getProfile(storage, DIGITS)
  assert.equal(profile.xp, 0)
})

test('engine: nyerah mengakhiri sesi dan membuka jawaban benar', async () => {
  const storage = memoryStorage()
  const { session } = await startQuiz(storage, CHAT, 'tekateki', { lang: 'id', rng: rng0, now: 4000000 })
  const expected = session.options[session.answerIndex]
  const result = await giveUp(storage, CHAT)
  assert.equal(result.answer, expected)
  assert.equal(await getSession(storage, CHAT, 4000001), null)
  assert.equal(await giveUp(storage, CHAT), null)
})

test('engine: sesi kedaluwarsa otomatis dibersihkan (now diinjeksi)', async () => {
  const storage = memoryStorage()
  const start = 5000000
  await startQuiz(storage, CHAT, 'tekateki', { lang: 'id', rng: rng0, now: start })
  assert.ok(await getSession(storage, CHAT, start + 119000))
  assert.equal(await getSession(storage, CHAT, start + 121000), null)
  const result = await answerQuiz(storage, CHAT, DIGITS, 'A', { now: start + 122000 })
  assert.equal(result.noSession, true)
})

test('engine family100: jawaban ketemu menambah poin, sesi lanjut sampai habis', async () => {
  const storage = memoryStorage()
  const { session } = await startQuiz(storage, CHAT, 'family100', { lang: 'id', rng: rng0, now: 6000000 })
  assert.equal(session.answers.length, QUIZ_SETS.family100[0].answers.length)
  const first = QUIZ_SETS.family100[0].answers[0]
  const r1 = await answerQuiz(storage, CHAT, DIGITS, first.text.id, { now: 6000001 })
  assert.equal(r1.correct, true)
  assert.equal(r1.finished, false)
  assert.equal(r1.points, first.points)
  let last = r1
  for (const a of QUIZ_SETS.family100[0].answers.slice(1)) {
    last = await answerQuiz(storage, CHAT, DIGITS, a.text.id, { now: 6000002 })
    assert.equal(last.correct, true)
  }
  assert.equal(last.finished, true)
  const total = QUIZ_SETS.family100[0].answers.reduce((s, a) => s + a.points, 0)
  assert.equal(last.earned, total)
  const profile = await getProfile(storage, DIGITS)
  assert.equal(profile.xp, total)
})

test('engine teks bebas: susunkata, tebakbendera, tebakkimia dengan pencocokan longgar', async () => {
  const storage = memoryStorage()
  await startQuiz(storage, 'c1@g.us', 'susunkata', { lang: 'id', rng: rng0, now: 7000000 })
  let r = await answerQuiz(storage, 'c1@g.us', DIGITS, '  KUCING!! ', { now: 7000001 })
  assert.equal(r.correct, true)

  await startQuiz(storage, 'c2@g.us', 'tebakbendera', { lang: 'id', rng: rng0, now: 7000000 })
  r = await answerQuiz(storage, 'c2@g.us', DIGITS, 'indonesia', { now: 7000001 })
  assert.equal(r.correct, true)

  const kimia = await startQuiz(storage, 'c3@g.us', 'tebakkimia', { lang: 'id', rng: rng0, now: 7000000 })
  assert.equal(kimia.question.text, 'H')
  r = await answerQuiz(storage, 'c3@g.us', DIGITS, 'Hidrogen', { now: 7000001 })
  assert.equal(r.correct, true)
})

test('jawab before: pesan teks biasa diperlakukan sebagai jawaban', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  await startQuiz(storage, CHAT, 'tekateki', { lang: 'id', rng: rng0, now: Date.now() })
  const correctText = QUIZ_SETS.tekateki[0].options[QUIZ_SETS.tekateki[0].answer].id
  await jawab.before(ctxFor({ storage, sock, text: correctText }))
  assert.equal(await getSession(storage, CHAT), null)
  const profile = await getProfile(storage, DIGITS)
  assert.equal(profile.xp, QUIZ_SETS.tekateki[0].points)
  const allText = JSON.stringify([...sock.sent, ...sock.relayed])
  assert.ok(allText.includes('BENAR'), 'balasan before harus mengumumkan jawaban benar')
})

test('jawab before: diam saat tidak ada sesi dan saat pesan berprefix', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  await jawab.before(ctxFor({ storage, sock, text: 'halo semua' }))
  assert.equal(sock.sent.length + sock.relayed.length, 0)
  await startQuiz(storage, CHAT, 'tekateki', { lang: 'id', rng: rng0, now: Date.now() })
  await jawab.before(ctxFor({ storage, sock, text: '.menu' }))
  assert.equal(sock.sent.length + sock.relayed.length, 0)
  assert.ok(await getSession(storage, CHAT))
})

test('family100 handler: memulai sesi dan mengirim tombol', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  await family100.handler(ctxFor({ storage, sock }))
  assert.ok(await getSession(storage, CHAT))
  assert.equal(sock.relayed.length, 1, 'handler harus mengirim pesan tombol (relayMessage)')
  const payload = JSON.stringify(sock.relayed[0].message)
  assert.ok(payload.includes('quick_reply'), 'payload harus berisi tombol quick_reply')
  assert.ok(payload.includes('.nyerah'), 'tombol menyerah harus ada')
  assert.ok(payload.includes('FAMILY 100'))
})

test('cekjodoh: deterministik untuk pasangan nama yang sama', () => {
  const a = cekjodoh.lovePercent('Budi', 'Sari')
  const b = cekjodoh.lovePercent('Budi', 'Sari')
  const c = cekjodoh.lovePercent('Sari', 'Budi')
  assert.equal(a, b)
  assert.equal(a, c)
  assert.ok(a >= 0 && a <= 100)
})

test('cekjodoh handler: balasan memuat persen dan disclaimer hiburan', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const ctx = ctxFor({ storage, sock, text: 'Budi & Sari' })
  ctx.args = ['Budi', '&', 'Sari']
  await cekjodoh.handler(ctx)
  const payload = JSON.stringify([...sock.sent, ...sock.relayed])
  assert.ok(payload.includes('%'))
  assert.ok(payload.includes('hiburan'), 'disclaimer hiburan wajib ada')
})

test('zodiak: tabel murni menghitung tanda dengan benar', () => {
  assert.equal(zodiak.zodiacFor(17, 8).key, 'leo')
  assert.equal(zodiak.zodiacFor(1, 1).key, 'capricorn')
  assert.equal(zodiak.zodiacFor(25, 12).key, 'capricorn')
  assert.equal(zodiak.zodiacFor(20, 1).key, 'aquarius')
  assert.equal(zodiak.zodiacFor(21, 3).key, 'aries')
  assert.equal(zodiak.zodiacFor(31, 2), null)
  assert.deepEqual(zodiak.parseBirthDate('17-08-2008'), { day: 17, month: 8, year: 2008 })
  assert.equal(zodiak.parseBirthDate('halo'), null)
})

test('normalizeAnswer: longgar terhadap kapital dan tanda baca', () => {
  assert.equal(normalizeAnswer('  Kucing!! '), 'kucing')
  assert.equal(normalizeAnswer('Korea   Selatan'), 'korea selatan')
})
