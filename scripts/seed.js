// Seed dataset kuis ke storage namespace 'quiz' key 'items'.
// Engine kuis membaca dari sana bila bentuknya cocok, fallback ke file data.
// Jalankan: node scripts/seed.js (driver mengikuti STORAGE_DRIVER di env).
import { createStorage } from '../src/storage/index.js'
import { QUIZ_SETS, WORD_LIST, FLAGS, ELEMENTS, IMAGE_WORDS } from '../src/data/quiz.js'
import { TRUTHS, DARES, KHODAMS, JOKES } from '../src/data/fun.js'

const items = {
  family100: QUIZ_SETS.family100,
  caklontong: QUIZ_SETS.caklontong,
  asahotak: QUIZ_SETS.asahotak,
  tekateki: QUIZ_SETS.tekateki,
  wordList: WORD_LIST,
  flags: FLAGS,
  elements: ELEMENTS,
  imageWords: IMAGE_WORDS,
}

const fun = { truths: TRUTHS, dares: DARES, khodams: KHODAMS, jokes: JOKES }

const storage = createStorage()
try {
  await storage.set('quiz', 'items', items)
  await storage.set('quiz', 'fun', fun)
  const counts = Object.fromEntries(Object.entries(items).map(([k, v]) => [k, v.length]))
  console.log('[seed] dataset kuis tersimpan ke storage quiz/items:', counts)
  console.log('[seed] dataset fun tersimpan ke storage quiz/fun:', Object.fromEntries(Object.entries(fun).map(([k, v]) => [k, v.length])))
} finally {
  await storage.close?.()
}
