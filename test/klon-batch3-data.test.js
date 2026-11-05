import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say as sayPersona } from '../src/persona/moe.js'
import { parseKataKata, getKataKata } from '../src/scrapers/search/katakata.js'
import {
  i18n as katakataI18n,
  handler as katakataHandler,
  formatKataKata,
  test as katakataTest,
} from '../plugins/quotes/katakata.js'
import {
  parseUsernames,
  normalizeTheme,
  normalizeMode,
} from '../src/scrapers/tools/usernamegen.js'
import {
  i18n as usernamegenI18n,
  handler as usernamegenHandler,
  parseUsernameArgs,
  formatUsernames,
  test as usernamegenTest,
} from '../plugins/user/usernamegen.js'
import {
  parseRandomNames,
  normalizeGender,
  normalizeCount,
  parseCategories,
  NAME_CATEGORIES,
} from '../src/scrapers/random/randomname.js'
import {
  i18n as randomnameI18n,
  handler as randomnameHandler,
  parseRandomNameArgs,
  formatRandomName,
  test as randomnameTest,
} from '../plugins/random/randomname.js'
import { findHeroInList } from '../src/scrapers/random/superhero.js'
import {
  i18n as superheroI18n,
  handler as superheroHandler,
  formatHero,
  test as superheroTest,
} from '../plugins/random/superhero.js'
import { parseMeme, getRandomMeme } from '../src/scrapers/random/meme.js'
import { imageKind } from '../src/scrapers/maker/removebg.js'
import {
  i18n as laheluI18n,
  handler as laheluHandler,
  formatMemeCaption,
  test as laheluTest,
} from '../plugins/random/lahelu.js'
import { SENJA, randomSenja } from '../src/data/senja.js'
import {
  i18n as senjaI18n,
  handler as senjaHandler,
  test as senjaTest,
} from '../plugins/fun/senja.js'

for (const mod of [katakataI18n, usernamegenI18n, randomnameI18n, superheroI18n, laheluI18n, senjaI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}

const tId = (k, vars) => translate('id', k, vars)
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])

function fakeStorage() {
  const map = new Map()
  return {
    map,
    async get(ns, key) {
      return map.get(`${ns}:${key}`)
    },
    async set(ns, key, value) {
      map.set(`${ns}:${key}`, value)
    },
    async delete(ns, key) {
      map.delete(`${ns}:${key}`)
    },
    async keys(ns) {
      return [...map.keys()].filter((k) => k.startsWith(`${ns}:`)).map((k) => k.slice(ns.length + 1))
    },
  }
}

// Pola fakeSock klon-batch2, ditambah opsi tanpa relayMessage supaya
// sendButtons jatuh ke fallback teks yang bisa diasertasi isinya.
function fakeSock({ withRelay = true, ...extra } = {}) {
  const sent = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: `MSG${sent.length}` } }
    },
    profilePictureUrl: async () => null,
    ...extra,
  }
  if (withRelay) sock.relayMessage = async () => ({})
  return { sock, sent }
}

function fakeCtx(sock, over = {}) {
  const replies = []
  const ctx = {
    sock,
    chat: '120363000000000000@g.us',
    sender: '628111@s.whatsapp.net',
    senderDigits: '628111',
    pushName: 'Penguji',
    isGroup: true,
    isOwner: false,
    isAdmin: false,
    isBotAdmin: false,
    args: [],
    text: '',
    command: '',
    lang: 'id',
    raw: { key: { id: 'RAW1' } },
    botJid: '6285187605007@s.whatsapp.net',
    mentionedJids: [],
    quoted: null,
    groupMetadata: null,
    t: tId,
    say: (mood) => sayPersona('id', mood),
    reply: async (txt) => {
      replies.push(txt)
      return { key: { id: 'REPLY1' } }
    },
    storage: fakeStorage(),
    getGroupMetadata: async () => ctx.groupMetadata,
    downloadMedia: async () => { throw new Error('tidak ada media') },
    downloadQuoted: async () => { throw new Error('tidak ada kutipan') },
    ...over,
  }
  return { ctx, replies }
}

const sentTexts = (sent) => sent.map((s) => s.content.text ?? s.content.caption ?? '').join('\n')

/* ---------------- katakata: Xemoz utama, DummyJSON cadangan ---------------- */

test('katakata: parseKataKata mengambil data string Xemoz dan menolak status gagal', () => {
  assert.equal(
    parseKataKata({ status: 'success', data: 'Hidup adalah perjalanan, bukan perlombaan.' }),
    'Hidup adalah perjalanan, bukan perlombaan.'
  )
  assert.equal(parseKataKata({ status: false, data: 'apa pun' }), null)
  assert.equal(parseKataKata({ data: { kata: 'Kata bersarang.' } }), 'Kata bersarang.')
  assert.equal(parseKataKata({ data: '   ' }), null)
  assert.equal(parseKataKata(null), null)
  const body = formatKataKata(tId, 'Tetap melangkah.')
  assert.match(body, /KATA-KATA BIJAK/)
  assert.ok(katakataTest.expect.test(body))
})

test('katakata: getKataKata memakai fetchImpl suntikan dan memvalidasi isi', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ status: 'success', data: 'Kata dari stub.' }),
  })
  assert.equal(await getKataKata({ fetchImpl }), 'Kata dari stub.')
})

test('katakata: handler sukses dari Xemoz lewat stub', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock)
  await katakataHandler(ctx, { fetchKata: async () => 'Jangan menyerah sebelum mencoba.' })
  assert.match(sentTexts(sent), /KATA-KATA BIJAK/)
  assert.match(sentTexts(sent), /Jangan menyerah sebelum mencoba/)
})

test('katakata: handler jatuh ke fallback quotes bila Xemoz gagal', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock)
  await katakataHandler(ctx, {
    fetchKata: async () => { throw new Error('Xemoz balas HTTP 500') },
    fetchQuote: async () => ({ quote: 'Stay hungry, stay foolish.', author: 'Steve Jobs' }),
  })
  assert.match(sentTexts(sent), /Stay hungry, stay foolish/)
  assert.match(sentTexts(sent), /Steve Jobs/)
  assert.match(sentTexts(sent), /DummyJSON/)
})

test('katakata: handler jujur gagal bila semua sumber mati', async () => {
  const { sock } = fakeSock({ withRelay: false })
  const { ctx, replies } = fakeCtx(sock)
  await katakataHandler(ctx, {
    fetchKata: async () => { throw new Error('Xemoz balas HTTP 500') },
    fetchQuote: async () => { throw new Error('DummyJSON balas HTTP 500') },
  })
  assert.match(replies[0], /KATA-KATA GAGAL/)
})

/* ---------------- usernamegen: Nexray format pipa ---------------- */

test('usernamegen: parseUsernames membaca result.result dan membuang duplikat', () => {
  const parsed = parseUsernames({ status: true, result: { result: ['kana_slayer', 'kana_slayer', ' moon_kana ', ''] } })
  assert.deepEqual(parsed, ['kana_slayer', 'moon_kana'])
  assert.deepEqual(parseUsernames({ result: ['solo'] }), ['solo'])
  assert.deepEqual(parseUsernames({ status: true }), [])
  assert.equal(normalizeTheme('fantasy'), 'fantasy')
  assert.equal(normalizeTheme('tidak-ada'), 'action')
  assert.equal(normalizeMode('ai'), 'ai')
  assert.equal(normalizeMode('aneh'), 'instans')
})

test('usernamegen: parseUsernameArgs pola pipa Elaina dengan bawaan action dan instans', () => {
  assert.deepEqual(parseUsernameArgs('kana | fantasy | ai'), { name: 'kana', theme: 'fantasy', mode: 'ai' })
  assert.deepEqual(parseUsernameArgs('kana'), { name: 'kana', theme: 'action', mode: 'instans' })
  assert.equal(parseUsernameArgs(''), null)
  assert.equal(parseUsernameArgs('kana | tema-ngawur').theme, 'action')
})

test('usernamegen: format membatasi daftar sampai 15 hasil', () => {
  const many = Array.from({ length: 30 }, (_, i) => `user${i}`)
  const body = formatUsernames(tId, { name: 'kana', theme: 'fantasy', mode: 'instans' }, many)
  assert.match(body, /USERNAME GENERATOR/)
  assert.match(body, /15\. user14/)
  assert.ok(!body.includes('user15'))
  assert.ok(usernamegenTest.expect.test(body))
})

test('usernamegen: handler sukses lewat stub menampilkan daftar dari API', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, { text: 'kana | mythology | instans' })
  let seenArgs = null
  await usernamegenHandler(ctx, {
    fetchUsernames: async (name, opts) => {
      seenArgs = { name, ...opts }
      return ['zeus_kana', 'kana_olympus']
    },
  })
  assert.deepEqual(seenArgs, { name: 'kana', theme: 'mythology', mode: 'instans' })
  assert.match(sentTexts(sent), /zeus_kana/)
  assert.match(sentTexts(sent), /mythology/)
})

test('usernamegen: handler tanpa nama memberi panduan format pipa', async () => {
  const { sock } = fakeSock({ withRelay: false })
  const { ctx, replies } = fakeCtx(sock, { text: '' })
  await usernamegenHandler(ctx)
  assert.match(replies[0], /usernamegen <nama>/)
})

/* ---------------- randomname: scrape BehindTheName ---------------- */

test('randomname: parseRandomNames mengambil nama dari .random-results a', () => {
  const html = `<ol class="random-results"><li><a href="/name/ada">Ada</a></li><li><a href="/name/loek">Loek</a></li></ol>`
  assert.deepEqual(parseRandomNames(html), ['Ada', 'Loek'])
  assert.deepEqual(parseRandomNames('<p>tidak ada hasil</p>'), [])
  assert.deepEqual(parseRandomNames(''), [])
})

test('randomname: normalisasi gender, jumlah, dan kategori ala Elaina', () => {
  assert.equal(normalizeGender('cowok'), 'm')
  assert.equal(normalizeGender('female'), 'f')
  assert.equal(normalizeGender('apa aja'), 'both')
  assert.equal(normalizeCount('3'), 3)
  assert.equal(normalizeCount('9'), 2)
  assert.equal(normalizeCount('abc'), 2)
  assert.deepEqual(parseCategories('eng, spa, ngawur, ind'), ['eng', 'spa', 'ind'])
  assert.ok(NAME_CATEGORIES.includes('jap'))
  assert.ok(NAME_CATEGORIES.length >= 100)
})

test('randomname: parseRandomNameArgs pola pipa gender|jumlah|surname|kategori', () => {
  assert.deepEqual(parseRandomNameArgs('cowok|3|random|eng,spa'), {
    gender: 'm',
    number: 3,
    surnameType: 'random',
    customSurname: '',
    usage: ['eng', 'spa'],
  })
  const custom = parseRandomNameArgs('cewek|2|Saputra|ind')
  assert.equal(custom.surnameType, 'custom')
  assert.equal(custom.customSurname, 'Saputra')
  assert.equal(parseRandomNameArgs(''), null)
})

test('randomname: handler sukses lewat stub menampilkan nama asli hasil scrape', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, { text: 'cowok|2||eng' })
  let seenInput = null
  await randomnameHandler(ctx, {
    fetchNames: async (input) => {
      seenInput = input
      return ['James', 'Arthur']
    },
  })
  assert.equal(seenInput.gender, 'm')
  assert.deepEqual(seenInput.usage, ['eng'])
  const body = formatRandomName(tId, seenInput, ['James', 'Arthur'])
  assert.ok(randomnameTest.expect.test(body))
  assert.match(sentTexts(sent), /James Arthur/)
  assert.match(sentTexts(sent), /BehindTheName/)
})

/* ---------------- superhero: dataset akabab ---------------- */

const HEROES = [
  {
    name: 'Batman',
    powerstats: { intelligence: 100, strength: 26, speed: 27, durability: 50, power: 47, combat: 100 },
    appearance: { gender: 'Male', race: 'Human', height: ['6\'2', '188 cm'], weight: ['210 lb', '95 kg'], 'eye-color': 'Blue', 'hair-color': 'Black' },
    biography: { 'full-name': 'Bruce Wayne', aliases: ['Insider', 'Matches Malone'], alignment: 'good', publisher: 'DC Comics' },
    work: { occupation: 'Businessman', base: 'Batcave' },
    connections: { 'group-affiliation': 'Justice League' },
    images: { sm: 'https://cdn.example/batman-sm.jpg', md: 'https://cdn.example/batman-md.jpg', lg: 'https://cdn.example/batman-lg.jpg' },
  },
  {
    name: 'Batgirl',
    powerstats: { intelligence: 90, strength: 11, speed: 33, durability: 40, power: 34, combat: 80 },
    appearance: { gender: 'Female', race: 'Human', height: ['5\'7', '170 cm'], weight: ['126 lb', '57 kg'], 'eye-color': 'Green', 'hair-color': 'Red' },
    biography: { 'full-name': 'Barbara Gordon', aliases: ['Oracle'], alignment: 'good', publisher: 'DC Comics' },
    work: { occupation: 'Librarian', base: 'Gotham City' },
    connections: {},
    images: { md: 'https://cdn.example/batgirl-md.jpg' },
  },
]

test('superhero: findHeroInList exact match dulu, lalu substring, case-insensitive', () => {
  assert.equal(findHeroInList(HEROES, 'batman').name, 'Batman')
  assert.equal(findHeroInList(HEROES, 'BATMAN').name, 'Batman')
  assert.equal(findHeroInList(HEROES, 'bat').name, 'Batman')
  assert.equal(findHeroInList(HEROES, 'girl').name, 'Batgirl')
  assert.equal(findHeroInList(HEROES, 'tidak-ada-hero-ini'), null)
  assert.equal(findHeroInList(HEROES, ''), null)
})

test('superhero: formatHero mengikuti susunan Elaina lengkap', () => {
  const body = formatHero(tId, HEROES[0])
  assert.match(body, /SUPERHERO INFO/)
  assert.match(body, /Bruce Wayne/)
  assert.match(body, /DC Comics/)
  assert.match(body, /188 cm/)
  assert.match(body, /Insider, Matches Malone/)
  assert.match(body, /Batcave/)
  assert.ok(superheroTest.expect.test(body))
})

test('superhero: handler mengirim gambar md plus caption statistik lewat stub', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, { text: 'batman' })
  const imgBuf = Buffer.concat([JPEG_MAGIC, Buffer.from([0xe0, 9, 9, 9])])
  const seenUrls = []
  await superheroHandler(ctx, {
    fetchHero: async () => HEROES[0],
    fetchImage: async (url) => { seenUrls.push(url); return imgBuf },
  })
  assert.deepEqual(seenUrls, ['https://cdn.example/batman-md.jpg'])
  assert.equal(sent.length, 1)
  assert.deepEqual(sent[0].content.image, imgBuf)
  assert.match(sent[0].content.caption, /SUPERHERO INFO/)
  assert.match(sent[0].content.caption, /Bruce Wayne/)
})

test('superhero: gambar gagal diunduh jatuh ke teks statistik, bukan menggantung', async () => {
  const relayed = []
  const { sock, sent } = fakeSock({
    withRelay: false,
    relayMessage: async (jid, msg) => { relayed.push(msg); return {} },
  })
  const { ctx, replies } = fakeCtx(sock, { text: 'batman' })
  await superheroHandler(ctx, {
    fetchHero: async () => HEROES[0],
    fetchImage: async () => { throw new Error('Unduh gagal: HTTP 503') },
  })
  const allText = [
    ...replies,
    ...sent.map((s) => JSON.stringify(s.content)),
    ...relayed.map((m) => JSON.stringify(m)),
  ].join('\n')
  assert.match(allText, /SUPERHERO INFO/)
  assert.match(allText, /Bruce Wayne/)
})

test('superhero: handler jujur bila hero tidak ditemukan dan bila tanpa nama', async () => {
  const { sock } = fakeSock()
  const missing = fakeCtx(sock, { text: 'hero-ngawur' })
  await superheroHandler(missing.ctx, { fetchHero: async () => null })
  assert.match(missing.replies[0], /TIDAK KETEMU/)
  const empty = fakeCtx(sock, { text: '' })
  await superheroHandler(empty.ctx, { fetchHero: async () => HEROES[0] })
  assert.match(empty.replies[0], /SUPERHERO/)
})

/* ---------------- lahelu: meme-api, anti NSFW, magic bytes ---------------- */

test('lahelu: parseMeme menolak NSFW dan URL tidak aman', () => {
  assert.deepEqual(parseMeme({ title: 'Meme lucu', url: 'https://i.redd.it/abc.jpg', nsfw: false, subreddit: 'memes' }), {
    title: 'Meme lucu',
    url: 'https://i.redd.it/abc.jpg',
    subreddit: 'memes',
  })
  assert.equal(parseMeme({ title: 'x', url: 'https://i.redd.it/abc.jpg', nsfw: true }), null)
  assert.equal(parseMeme({ title: 'x', url: 'http://insecure.example/a.jpg', nsfw: false }), null)
  assert.equal(parseMeme(null), null)
})

test('lahelu: getRandomMeme memvalidasi magic bytes unduhan', async () => {
  const jpeg = Buffer.concat([JPEG_MAGIC, Buffer.from([0xe0, 1, 2, 3, 4, 5, 6, 7, 8])])
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ title: 'Stub meme', url: 'https://i.redd.it/stub.jpg', nsfw: false, subreddit: 'dankmemes' }),
  })
  const download = async () => ({ buffer: jpeg })
  const meme = await getRandomMeme({ fetchImpl, download })
  assert.equal(meme.kind, 'jpeg')
  assert.equal(imageKind(meme.buffer), 'jpeg')
  assert.equal(meme.title, 'Stub meme')

  const badDownload = async () => ({ buffer: Buffer.from('ini bukan gambar sama sekali') })
  await assert.rejects(() => getRandomMeme({ fetchImpl, download: badDownload }), /bukan gambar|NSFW/)
})

test('lahelu: getRandomMeme melewati meme NSFW lalu mengambil yang aman', async () => {
  const jpeg = Buffer.concat([JPEG_MAGIC, Buffer.from([0xe0, 9, 9, 9, 9, 9, 9, 9, 9, 9])])
  let call = 0
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => {
      call++
      return call === 1
        ? { title: 'Bahaya', url: 'https://i.redd.it/bad.jpg', nsfw: true, subreddit: 'x' }
        : { title: 'Aman', url: 'https://i.redd.it/good.jpg', nsfw: false, subreddit: 'memes' }
    },
  })
  const meme = await getRandomMeme({ fetchImpl, download: async () => ({ buffer: jpeg }) })
  assert.equal(meme.title, 'Aman')
})

test('lahelu: handler mengirim gambar dengan caption yang menyebut sumber meme-api', async () => {
  const png = Buffer.concat([PNG_MAGIC, Buffer.from([0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])])
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await laheluHandler(ctx, {
    fetchMeme: async () => ({ title: 'Kucing bingung', url: 'https://i.redd.it/cat.png', subreddit: 'memes', buffer: png, kind: 'png' }),
  })
  assert.equal(sent.length, 1)
  assert.ok(sent[0].content.image.equals(png))
  assert.match(sent[0].content.caption, /Kucing bingung/)
  assert.match(sent[0].content.caption, /meme-api\.com/)
  assert.ok(laheluTest.expect.test(sent[0].content.caption))
  assert.match(formatMemeCaption(tId, { title: 'Tanpa sub', subreddit: '' }), /Tanpa sub/)
})

test('lahelu: handler jujur gagal bila sumber mati', async () => {
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await laheluHandler(ctx, { fetchMeme: async () => { throw new Error('meme-api balas HTTP 503') } })
  assert.match(replies[0], /MEME GAGAL/)
})

/* ---------------- senja: dataset lokal besar, acak beneran ---------------- */

test('senja: dataset lokal besar, unik, dan dwibahasa', () => {
  assert.ok(SENJA.length >= 40, `dataset senja terlalu kecil: ${SENJA.length}`)
  const ids = SENJA.map((s) => s.id)
  assert.equal(new Set(ids).size, ids.length, 'kata senja tidak boleh duplikat')
  for (const item of SENJA) {
    assert.ok(item.id.length > 10)
    assert.ok(item.en.length > 10)
  }
})

test('senja: randomSenja mengikuti rng, bukan hash tetap', () => {
  assert.equal(randomSenja(() => 0, 'id'), SENJA[0].id)
  assert.equal(randomSenja(() => 0.9999, 'id'), SENJA[SENJA.length - 1].id)
  assert.equal(randomSenja(() => 0, 'en'), SENJA[0].en)
  const seen = new Set(Array.from({ length: 20 }, (_, i) => randomSenja(() => i / 20, 'id')))
  assert.ok(seen.size >= 10, 'pilihan senja harus bervariasi mengikuti rng')
})

test('senja: handler mengirim kalimat berbeda untuk rng berbeda', async () => {
  const first = fakeSock({ withRelay: false })
  const a = fakeCtx(first.sock)
  await senjaHandler(a.ctx, { rng: () => 0 })
  const second = fakeSock({ withRelay: false })
  const b = fakeCtx(second.sock)
  await senjaHandler(b.ctx, { rng: () => 0.9999 })
  assert.match(sentTexts(first.sent), /KALIMAT SENJA/)
  assert.ok(sentTexts(first.sent).includes(SENJA[0].id))
  assert.ok(sentTexts(second.sent).includes(SENJA[SENJA.length - 1].id))
  assert.notEqual(sentTexts(first.sent), sentTexts(second.sent))
  assert.ok(senjaTest.expect.test(sentTexts(first.sent)))
})
