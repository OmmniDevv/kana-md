// Engine kuis KANA: sesi per chat di storage namespace 'kv', key 'quiz:<chat>'.
// Jenis: pilihan ganda (caklontong, asahotak, tekateki), family100 (teks bebas,
// banyak jawaban, poin per jawaban), dan teks bebas satu jawaban (susunkata,
// tebakbendera, tebakkimia, tebakgambar).
// Keputusan desain: engine mengimpor addXp dari user-service dan memberi XP
// sendiri saat jawaban benar final, supaya plugin kuis tetap tipis.
// Dataset diambil dari storage namespace 'quiz' key 'items' bila seed pernah
// dijalankan dan bentuknya cocok; selain itu fallback ke src/data/quiz.js.
import { QUIZ_SETS, WORD_LIST, FLAGS, ELEMENTS, IMAGE_WORDS, TEXT_SETS } from '../data/quiz.js'
import { addXp } from '../services/user-service.js'

export const MC_TYPES = ['caklontong', 'asahotak', 'tekateki']
export const TEXT_POINTS = 10
export const TTL_MS = { default: 120000, family100: 300000 }

const KEY = (chat) => `quiz:${chat}`

export function normalizeAnswer(text) {
  return String(text ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length) % arr.length]
}

function shuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function scrambleWord(word, rng) {
  const letters = word.split('')
  let out = word
  for (let attempt = 0; attempt < 10 && out === word; attempt++) out = shuffle(letters, rng).join('')
  return out
}

// Sembunyikan huruf di indeks ganjil: KUCING menjadi K*C*NG.
export function maskWord(word) {
  return String(word ?? '')
    .split('')
    .map((ch, i) => (i % 2 === 1 ? '*' : ch))
    .join('')
}

async function loadData(storage) {
  try {
    const seeded = await storage.get('quiz', 'items')
    if (seeded && typeof seeded === 'object') {
      const ok =
        Array.isArray(seeded.family100) || Array.isArray(seeded.wordList) || Array.isArray(seeded.flags)
      if (ok) {
        return {
          sets: {
            family100: Array.isArray(seeded.family100) ? seeded.family100 : QUIZ_SETS.family100,
            caklontong: Array.isArray(seeded.caklontong) ? seeded.caklontong : QUIZ_SETS.caklontong,
            asahotak: Array.isArray(seeded.asahotak) ? seeded.asahotak : QUIZ_SETS.asahotak,
            tekateki: Array.isArray(seeded.tekateki) ? seeded.tekateki : QUIZ_SETS.tekateki,
          },
          wordList: Array.isArray(seeded.wordList) ? seeded.wordList : WORD_LIST,
          flags: Array.isArray(seeded.flags) ? seeded.flags : FLAGS,
          elements: Array.isArray(seeded.elements) ? seeded.elements : ELEMENTS,
          imageWords: Array.isArray(seeded.imageWords) ? seeded.imageWords : IMAGE_WORDS,
          textSets: TEXT_SETS,
        }
      }
    }
  } catch {}
  return { sets: QUIZ_SETS, wordList: WORD_LIST, flags: FLAGS, elements: ELEMENTS, imageWords: IMAGE_WORDS, textSets: TEXT_SETS }
}

export async function getSession(storage, chat, now = Date.now()) {
  const session = await storage.get('kv', KEY(chat))
  if (!session) return null
  if (now > (session.expiresAt ?? 0)) {
    await storage.delete('kv', KEY(chat))
    return null
  }
  return session
}

export async function startQuiz(storage, chat, type, { lang = 'id', rng = Math.random, now = Date.now(), startedBy = '' } = {}) {
  const data = await loadData(storage)
  const ttl = TTL_MS[type] ?? TTL_MS.default
  const base = { type, lang, startedBy, startedAt: now, expiresAt: now + ttl, points: 0, earned: 0 }
  let session

  if (type === 'family100') {
    const item = pick(data.sets.family100, rng)
    session = {
      ...base,
      question: item.q[lang] ?? item.q.id,
      answers: item.answers.map((a) => ({ text: a.text, points: a.points, found: false })),
      points: item.answers.reduce((s, a) => s + a.points, 0),
    }
  } else if (MC_TYPES.includes(type)) {
    const item = pick(data.sets[type], rng)
    const order = shuffle(item.options.map((_, i) => i), rng)
    session = {
      ...base,
      question: item.q[lang] ?? item.q.id,
      options: order.map((i) => item.options[i][lang] ?? item.options[i].id),
      optionsAll: order.map((i) => item.options[i]),
      answerIndex: order.indexOf(item.answer),
      points: item.points ?? 10,
    }
  } else if (type === 'susunkata') {
    const word = pick(data.wordList, rng)
    session = {
      ...base,
      question: scrambleWord(String(word), rng).toUpperCase(),
      answerText: String(word),
      accepted: [normalizeAnswer(word)],
      points: TEXT_POINTS,
    }
  } else if (type === 'tebakbendera') {
    const flag = pick(data.flags, rng)
    session = {
      ...base,
      question: flag.emoji,
      answerText: flag.country[lang] ?? flag.country.id,
      accepted: [normalizeAnswer(flag.country.id), normalizeAnswer(flag.country.en)],
      points: TEXT_POINTS,
    }
  } else if (type === 'tebakkimia') {
    const el = pick(data.elements, rng)
    const symbolFirst = rng() < 0.5
    const name = el.name[lang] ?? el.name.id
    session = {
      ...base,
      question: symbolFirst ? el.symbol : name,
      answerText: symbolFirst ? name : el.symbol,
      accepted: [normalizeAnswer(el.name.id), normalizeAnswer(el.name.en), normalizeAnswer(el.symbol)],
      mode: symbolFirst ? 'symbol-to-name' : 'name-to-symbol',
      points: TEXT_POINTS,
    }
  } else if (type === 'tebakgambar') {
    const item = pick(data.imageWords, rng)
    const word = item.word[lang] ?? item.word.id
    session = {
      ...base,
      question: maskWord(word),
      answerText: word,
      accepted: [normalizeAnswer(item.word.id), normalizeAnswer(item.word.en)],
      emoji: item.emoji,
      category: item.category[lang] ?? item.category.id,
      points: TEXT_POINTS,
    }
  } else if (data.textSets?.[type]?.length) {
    // Topik tebak teks bebas generik dari TEXT_SETS (src/data/quiz.js):
    // petunjuk dua bahasa, satu jawaban benar plus varian yang diterima.
    const item = pick(data.textSets[type], rng)
    const answer = item.a[lang] ?? item.a.id
    const accepted = new Set(
      [item.a.id, item.a.en, ...(item.accept ?? [])].map((v) => normalizeAnswer(v)).filter(Boolean)
    )
    session = {
      ...base,
      question: item.q[lang] ?? item.q.id,
      answerText: answer,
      accepted: [...accepted],
      points: TEXT_POINTS,
    }
  } else {
    throw new Error(`jenis kuis tidak dikenal: ${type}`)
  }

  await storage.set('kv', KEY(chat), session)
  const question = {
    type,
    text: session.question,
    options: session.options ?? null,
    points: session.points,
    expiresAt: session.expiresAt,
    emoji: session.emoji ?? '',
    category: session.category ?? '',
    mode: session.mode ?? '',
    answersCount: session.answers?.length ?? 0,
  }
  return { session, question }
}

function mcAnswerIndex(session, text) {
  const raw = String(text ?? '').trim()
  const letter = raw.toLowerCase()
  if (/^[a-d]$/.test(letter)) return letter.charCodeAt(0) - 97
  if (/^[1-4]$/.test(letter)) return Number(letter) - 1
  const norm = normalizeAnswer(raw)
  const idx = (session.options ?? []).findIndex((opt) => normalizeAnswer(opt) === norm)
  if (idx >= 0) return idx
  const allIdx = (session.optionsAll ?? []).findIndex(
    (opt) => normalizeAnswer(opt.id) === norm || normalizeAnswer(opt.en) === norm
  )
  return allIdx
}

export async function answerQuiz(storage, chat, digits, text, { now = Date.now() } = {}) {
  const session = await getSession(storage, chat, now)
  if (!session) return { correct: false, finished: true, noSession: true, points: 0, answer: null, type: null }

  // Family100: cocokkan ke jawaban yang belum ketemu; sesi lanjut.
  if (session.type === 'family100') {
    const norm = normalizeAnswer(text)
    const hit = session.answers.find(
      (a) => !a.found && (normalizeAnswer(a.text.id) === norm || normalizeAnswer(a.text.en) === norm)
    )
    if (!hit) {
      return {
        correct: false, finished: false, points: 0, earned: session.earned ?? 0,
        remaining: session.answers.filter((a) => !a.found).length, answer: null, type: session.type,
      }
    }
    hit.found = true
    session.earned = (session.earned ?? 0) + hit.points
    const remaining = session.answers.filter((a) => !a.found).length
    const answerLabel = hit.text[session.lang] ?? hit.text.id
    if (remaining === 0) {
      await storage.delete('kv', KEY(chat))
      if (digits) await addXp(storage, digits, session.earned).catch(() => {})
      return { correct: true, finished: true, points: hit.points, earned: session.earned, remaining: 0, answer: answerLabel, type: session.type }
    }
    await storage.set('kv', KEY(chat), session)
    return { correct: true, finished: false, points: hit.points, earned: session.earned, remaining, answer: answerLabel, type: session.type }
  }

  let correct = false
  let answerLabel = session.answerText ?? ''
  if (MC_TYPES.includes(session.type)) {
    correct = mcAnswerIndex(session, text) === session.answerIndex
    answerLabel = session.options?.[session.answerIndex] ?? ''
  } else {
    correct = (session.accepted ?? []).includes(normalizeAnswer(text))
  }

  if (!correct) {
    return { correct: false, finished: false, points: 0, answer: null, type: session.type }
  }
  await storage.delete('kv', KEY(chat))
  if (digits) await addXp(storage, digits, session.points ?? 0).catch(() => {})
  return { correct: true, finished: true, points: session.points ?? 0, earned: session.points ?? 0, answer: answerLabel, type: session.type }
}

export async function giveUp(storage, chat) {
  const session = await storage.get('kv', KEY(chat))
  if (!session) return null
  await storage.delete('kv', KEY(chat))
  let answer = session.answerText ?? ''
  if (MC_TYPES.includes(session.type)) answer = session.options?.[session.answerIndex] ?? ''
  if (session.type === 'family100') {
    answer = session.answers
      .filter((a) => !a.found)
      .map((a) => `${a.text[session.lang] ?? a.text.id} (${a.points})`)
      .join(', ')
  }
  return { session, answer, type: session.type, earned: session.earned ?? 0 }
}

export default { startQuiz, answerQuiz, giveUp, getSession, normalizeAnswer, maskWord, MC_TYPES }
