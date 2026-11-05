import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createCanvas } from '@napi-rs/canvas'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say as sayPersona } from '../src/persona/moe.js'
import { i18n as bucinI18n, BUCIN_WORDS, pickBucin, handler as bucinHandler } from '../plugins/fun/bucin.js'
import { i18n as burikI18n, makeBurik, handler as burikHandler } from '../plugins/fun/burik.js'
import { i18n as cobaI18n, COBA_ANSWERS, pickCobaAnswer, handler as cobaHandler } from '../plugins/fun/coba.js'
import {
  i18n as fmlI18n,
  parseFmlStories,
  fetchFmlStory,
  handler as fmlHandler,
} from '../plugins/fun/fuckmylife.js'
import {
  i18n as gachanasipI18n,
  drawNasip,
  formatNasip,
  handler as gachanasipHandler,
} from '../plugins/fun/gachanasip.js'
import {
  i18n as gachatomboyI18n,
  TOMBOY_LIST,
  drawTomboy,
  formatTomboy,
  handler as gachatomboyHandler,
} from '../plugins/fun/gachatomboy.js'
import {
  i18n as halahI18n,
  gayaHalah,
  gayaHilih,
  handler as halahHandler,
} from '../plugins/fun/halah.js'
import {
  i18n as kematianI18n,
  DEATH_CAUSES,
  randomDeathDate,
  pickDeathCause,
  handler as kematianHandler,
} from '../plugins/fun/kematian.js'
import {
  i18n as lifefactI18n,
  computeLifeFacts,
  formatLifeFacts,
  handler as lifefactHandler,
} from '../plugins/fun/lifefact.js'
import { i18n as lupakanI18n, LUPAKAN_QUOTES, pickLupakanQuote, handler as lupakanHandler } from '../plugins/fun/lupakan.js'
import {
  i18n as mimpiI18n,
  generateDream,
  formatDream,
  handler as mimpiHandler,
} from '../plugins/fun/mimpi.js'
import {
  i18n as moveonI18n,
  MOVEON_STEPS,
  MOVEON_FAIL_REASONS,
  formatMoveon,
  handler as moveonHandler,
} from '../plugins/fun/moveon.js'
import { i18n as renunganI18n, RENUNGAN_QUOTES, pickRenunganQuote, handler as renunganHandler } from '../plugins/fun/renungan.js'
import {
  i18n as seberapagilaI18n,
  tierFor,
  drawCrazy,
  handler as seberapagilaHandler,
} from '../plugins/fun/seberapagila.js'
import { i18n as tebakumurI18n, AGE_READINGS, pickAgeReading, handler as tebakumurHandler } from '../plugins/fun/tebakumur.js'

for (const mod of [
  bucinI18n, burikI18n, cobaI18n, fmlI18n, gachanasipI18n, gachatomboyI18n, halahI18n,
  kematianI18n, lifefactI18n, lupakanI18n, mimpiI18n, moveonI18n, renunganI18n,
  seberapagilaI18n, tebakumurI18n,
]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}

const tId = (k, vars) => translate('id', k, vars)
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])

function fakeSock(extra = {}) {
  const sent = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: `MSG${sent.length}` } }
    },
    // MB.Button mengirim lewat relayMessage; di tes jalur itu dibuat
    // gagal supaya sendButtons jatuh ke fallback teks sendMessage,
    // sama seperti perilaku klien tanpa dukungan tombol.
    relayMessage: async () => { throw new Error('relay tidak tersedia di tes') },
    profilePictureUrl: async () => null,
    ...extra,
  }
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
    downloadMedia: async () => { throw new Error('tidak ada media') },
    downloadQuoted: async () => { throw new Error('tidak ada kutipan') },
    ...over,
  }
  return { ctx, replies }
}

function tinyPngBuffer(w = 240, h = 120) {
  const canvas = createCanvas(w, h)
  const c = canvas.getContext('2d')
  c.fillStyle = '#00a884'
  c.fillRect(0, 0, w, h)
  return canvas.toBuffer('image/png')
}

// Semua teks yang terlihat user dari satu handler: fallback tombol
// (sendMessage teks) plus reply biasa, digabung jadi satu string.
function allText(sent, replies) {
  return [...sent.map((s) => s.content?.text || s.content?.caption || ''), ...replies].join('\n')
}

/* ---------------- Meta: tidak ada hashPercent tersisa ---------------- */

test('batch3: 15 file plugin bersih dari hashPercent', async () => {
  const names = [
    'bucin', 'burik', 'coba', 'fuckmylife', 'gachanasip', 'gachatomboy', 'halah',
    'kematian', 'lifefact', 'lupakan', 'mimpi', 'moveon', 'renungan',
    'seberapagila', 'tebakumur',
  ]
  for (const name of names) {
    const src = await readFile(new URL(`../plugins/fun/${name}.js`, import.meta.url), 'utf8')
    assert.ok(!src.includes('hashPercent'), `${name} masih memakai hashPercent`)
    assert.ok(!src.includes('\u2014'), `${name} mengandung em dash`)
  }
})

/* ---------------- bucin ---------------- */

test('bucin: dataset besar dan pilihan acak mengikuti rng', () => {
  assert.ok(BUCIN_WORDS.length >= 40, `dataset bucin terlalu kecil: ${BUCIN_WORDS.length}`)
  assert.equal(pickBucin(() => 0), BUCIN_WORDS[0])
  assert.equal(pickBucin(() => 0.9999), BUCIN_WORDS[BUCIN_WORDS.length - 1])
})

test('bucin: handler mengirim satu kata bucin dari dataset', async () => {
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await bucinHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /KATA BUCIN/)
  assert.ok(BUCIN_WORDS.some((w) => text.includes(w)), 'kutipan harus berasal dari dataset')
})

/* ---------------- burik ---------------- */

test('burik: makeBurik menghasilkan JPEG valid kecil dari PNG besar', async () => {
  const out = await makeBurik(tinyPngBuffer(240, 120))
  assert.ok(Buffer.isBuffer(out))
  assert.ok(out.subarray(0, 3).equals(JPEG_MAGIC), 'hasil burik harus JPEG')
  const { loadImage } = await import('@napi-rs/canvas')
  const img = await loadImage(out)
  assert.equal(Math.max(img.width, img.height), 100)
  assert.equal(await makeBurik(Buffer.from('ini bukan gambar sama sekali')), null)
})

test('burik: handler memproses foto kutipan menjadi gambar JPEG', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, {
    quoted: { sender: '628111@s.whatsapp.net', stanzaId: 'Q1', message: { imageMessage: {} } },
    downloadQuoted: async () => tinyPngBuffer(),
  })
  await burikHandler(ctx)
  assert.equal(sent.length, 1)
  assert.ok(Buffer.isBuffer(sent[0].content.image))
  assert.ok(sent[0].content.image.subarray(0, 3).equals(JPEG_MAGIC), 'gambar terkirim harus JPEG')
  assert.match(sent[0].content.caption, /FOTO BURIK/)
})

test('burik: handler menolak tanpa gambar dan berkas bukan gambar', async () => {
  const { sock } = fakeSock()
  const noImage = fakeCtx(sock)
  await burikHandler(noImage.ctx)
  assert.match(noImage.replies[0], /FOTO BURIK/)
  const withText = fakeCtx(sock, {
    quoted: { sender: '628111@s.whatsapp.net', stanzaId: 'Q1', message: { imageMessage: {} } },
    downloadQuoted: async () => Buffer.from('teks bukan gambar'),
  })
  await burikHandler(withText.ctx)
  assert.match(withText.replies[0], /BUKAN GAMBAR/)
})

/* ---------------- coba ---------------- */

test('coba: daftar 20 jawaban dan handler mengulang pertanyaan plus tebakan', async () => {
  assert.equal(COBA_ANSWERS.length, 20)
  assert.equal(pickCobaAnswer(() => 0), COBA_ANSWERS[0])
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { text: 'tebak apa yang aku pikirkan' })
  await cobaHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /COBA TEBAK/)
  assert.ok(text.includes('tebak apa yang aku pikirkan'))
  assert.ok(COBA_ANSWERS.some((a) => text.includes(a)), 'jawaban harus dari daftar coba')
})

test('coba: tanpa pertanyaan handler memberi petunjuk pakai', async () => {
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await cobaHandler(ctx)
  assert.match(replies[0], /COBA/)
})

/* ---------------- fuckmylife ---------------- */

const FML_SAMPLE_HTML = `
<html><body>
<article class="relative isolate"><div><p class="text-[1.075rem] leading-relaxed">Today, I locked my keys in the car with the engine still running outside my office. FML</p></div></article>
<article><p>Today, I locked my keys in the car with the engine still running outside my office. FML</p></article>
<article><p>Today, my cat knocked a full cup of coffee onto my laptop five minutes before my deadline. FML</p></article>
<article><p>Some promo paragraph that is not a story at all and keeps going on.</p></article>
<article><p>Today, short. FML</p></article>
</body></html>`

test('fuckmylife: parser mengekstrak cerita Today ... FML, dedupe, buang non-cerita', () => {
  const stories = parseFmlStories(FML_SAMPLE_HTML)
  assert.equal(stories.length, 2)
  assert.match(stories[0], /locked my keys/)
  assert.match(stories[1], /my cat knocked/)
  assert.deepEqual(parseFmlStories('<html><body><p>halo</p></body></html>'), [])
  assert.deepEqual(parseFmlStories(''), [])
})

test('fuckmylife: fetchFmlStory memilih dari hasil parse memakai fetch suntikan', async () => {
  const fetchImpl = async () => ({ ok: true, status: 200, text: async () => FML_SAMPLE_HTML })
  const story = await fetchFmlStory({ fetchImpl, rng: () => 0.9999 })
  assert.match(story, /my cat knocked/)
  const badFetch = async () => ({ ok: false, status: 503, text: async () => '' })
  await assert.rejects(() => fetchFmlStory({ fetchImpl: badFetch }), /HTTP 503/)
})

test('fuckmylife: handler mengirim cerita dari fetch dengan label sumber', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => FML_SAMPLE_HTML })
  try {
    const { sock, sent } = fakeSock()
    const { ctx, replies } = fakeCtx(sock)
    await fmlHandler(ctx)
    const text = allText(sent, replies)
    assert.match(text, /FML STORY/)
    assert.match(text, /fmylife\.com/)
    assert.ok(parseFmlStories(FML_SAMPLE_HTML).some((s) => text.includes(s)))
  } finally {
    globalThis.fetch = originalFetch
  }
})

/* ---------------- gachanasip ---------------- */

test('gachanasip: tarikan memilih nasip dan bingkai mengikuti rng', () => {
  const pack = gachanasipI18n.id.gachanasip
  assert.ok(pack.nasips.length >= 10)
  assert.equal(pack.templates.length, 3)
  const first = drawNasip(pack, () => 0)
  assert.equal(first.nasip, pack.nasips[0])
  assert.equal(first.templateIndex, 0)
  const body = formatNasip(pack, 'Penguji', first)
  assert.match(body, /GACHA NASIP/)
  assert.ok(body.includes(pack.nasips[0]))
})

test('gachanasip: handler mengirim tarikan nasip', async () => {
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await gachanasipHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /NASIP/)
  assert.ok(gachanasipI18n.id.gachanasip.nasips.some((n) => text.includes(n)))
})

/* ---------------- gachatomboy ---------------- */

test('gachatomboy: daftar 80 nama dan tarikan mengikuti rng seperti gachabini', () => {
  assert.equal(TOMBOY_LIST.length, 80)
  assert.ok(TOMBOY_LIST.includes('Misaki Ayuzawa'))
  const first = drawTomboy(() => 0)
  assert.equal(first.char, 'Misaki Ayuzawa')
  assert.equal(first.love, 0)
  const last = drawTomboy(() => 0.9999)
  assert.equal(last.char, TOMBOY_LIST[TOMBOY_LIST.length - 1])
  assert.equal(last.love, 100)
  const pack = gachatomboyI18n.id.gachatomboy
  const body = formatTomboy(pack, 'Penguji', first)
  assert.match(body, /GACHA TOMBOY/)
  assert.match(body, /Misaki Ayuzawa/)
})

test('gachatomboy: handler mengirim hasil gacha', async () => {
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await gachatomboyHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /TOMBOY/)
  assert.ok(TOMBOY_LIST.some((c) => text.includes(c)))
  assert.match(text, /\*\d+%/)
})

/* ---------------- halah / hilih ---------------- */

test('halah: transformasi contoh persis gaya halah dan hilih', () => {
  assert.equal(gayaHalah('halo dunia'), 'hala dania')
  assert.equal(gayaHilih('halo dunia'), 'hili dinii')
  assert.equal(gayaHalah('congratulations'), 'cangratalatians')
  assert.equal(gayaHilih('level'), 'livil')
  assert.equal(gayaHalah('you'), 'yaa')
  assert.equal(gayaHilih('you'), 'yii')
})

test('halah: teks yang sudah diubah ditolak kedua gaya', () => {
  assert.equal(gayaHalah('cangratalataans'), null)
  assert.equal(gayaHalah('laval'), null)
  assert.equal(gayaHilih('cingritilitiins'), null)
  assert.equal(gayaHilih('livil'), null)
})

test('halah: handler memakai gaya sesuai perintah, kutipan, dan penolakan', async () => {
  const { sock } = fakeSock()
  const a = fakeCtx(sock, { text: 'halo dunia', command: 'halah' })
  await halahHandler(a.ctx)
  assert.equal(a.replies[0], 'hala dania')
  const b = fakeCtx(sock, { text: 'halo dunia', command: 'hilih' })
  await halahHandler(b.ctx)
  assert.equal(b.replies[0], 'hili dinii')
  const c = fakeCtx(sock, { quoted: { message: { conversation: 'halo' } }, command: 'halah' })
  await halahHandler(c.ctx)
  assert.equal(c.replies[0], 'hala')
  const d = fakeCtx(sock, { text: 'laval', command: 'halah' })
  await halahHandler(d.ctx)
  assert.match(d.replies[0], /sudah pernah diubah/)
  const e = fakeCtx(sock, { command: 'halah' })
  await halahHandler(e.ctx)
  assert.match(e.replies[0], /HALAH/)
})

/* ---------------- kematian ---------------- */

test('kematian: tanggal acak selalu nyata dan di masa depan, penyebab dari daftar', () => {
  const now = new Date(2026, 0, 15)
  const date = randomDeathDate(() => 0, now)
  assert.deepEqual([date.getFullYear(), date.getMonth(), date.getDate()], [2027, 0, 1])
  for (let i = 0; i < 50; i++) {
    const d = randomDeathDate(Math.random, now)
    assert.ok(d.getTime() > now.getTime(), 'tanggal harus di masa depan')
    assert.equal(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() >= d.getDate(), true)
  }
  assert.equal(DEATH_CAUSES.length, 10)
  assert.equal(pickDeathCause(() => 0), DEATH_CAUSES[0])
})

test('kematian: handler mengirim ramalan berisi nama, tanggal, penyebab', async () => {
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { text: 'Budi' })
  await kematianHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /RAMALAN KEMATIAN/)
  assert.ok(text.includes('Budi'))
  assert.ok(DEATH_CAUSES.some((c) => text.includes(c.replace(/ [^\p{L}\p{N} ]+$/u, '').slice(0, 12)) || text.includes(c)))
})

/* ---------------- lifefact ---------------- */

test('lifefact: angka konsisten untuk tanggal contoh 20 tahun persis', () => {
  const now = new Date(Date.UTC(2020, 0, 10))
  const facts = computeLifeFacts('2000-01-10', now)
  assert.equal(facts.years, 20)
  assert.equal(facts.days, 7305)
  assert.equal(facts.hours, 175320)
  assert.equal(facts.minutes, 10519200)
  assert.equal(facts.seconds, 631152000)
  assert.equal(facts.heartBeats, 757382400)
  assert.equal(facts.breaths, 168307200)
  assert.equal(facts.oxygen, 4207680)
  assert.equal(facts.co2, 3366144)
  assert.equal(facts.calories, 14610000)
  const body = formatLifeFacts(tId, facts)
  assert.match(body, /FAKTA KEHIDUPAN/)
  assert.ok(body.includes('757.382.400'), 'detak jantung harus format id-ID')
  assert.ok(body.includes('73 tahun'))
})

test('lifefact: tanggal tidak valid dan masa depan ditolak', () => {
  assert.equal(computeLifeFacts('2021-02-31'), null)
  assert.equal(computeLifeFacts('31-01-2021'), null)
  assert.equal(computeLifeFacts('2999-01-01'), null)
  assert.equal(computeLifeFacts(''), null)
})

test('lifefact: handler menghitung dari argumen dan menolak tanggal buruk', async () => {
  const { sock, sent } = fakeSock()
  const ok = fakeCtx(sock, { text: '2002-01-11' })
  await lifefactHandler(ok.ctx)
  const text = allText(sent, ok.replies)
  assert.match(text, /FAKTA KEHIDUPAN/)
  assert.match(text, /Total detak jantung:/)
  const bad = fakeCtx(sock, { text: '2021-02-31' })
  await lifefactHandler(bad.ctx)
  assert.match(bad.replies[0], /TANGGAL TIDAK VALID/)
  const empty = fakeCtx(sock)
  await lifefactHandler(empty.ctx)
  assert.match(empty.replies[0], /FAKTA KEHIDUPAN/)
})

/* ---------------- lupakan ---------------- */

test('lupakan: 15 kutipan, handler menutup dengan kalimat tetap', async () => {
  assert.equal(LUPAKAN_QUOTES.length, 15)
  assert.equal(pickLupakanQuote(() => 0), LUPAKAN_QUOTES[0])
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await lupakanHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /LUPAKAN MASA LALU/)
  assert.ok(LUPAKAN_QUOTES.some((q) => text.includes(q)))
  assert.ok(text.includes('kamu lebih kuat dari yang kamu pikirkan'))
})

/* ---------------- mimpi ---------------- */

test('mimpi: generator menggabungkan komponen acak yang valid', () => {
  const dream = generateDream(() => 0)
  assert.equal(dream.level, 'Lucid ✨')
  assert.equal(dream.elements.length, 3)
  assert.equal(new Set(dream.elements).size, 3)
  assert.equal(dream.events.length, 2)
  assert.equal(dream.encounters.length, 2)
  assert.equal(dream.powers.length, 2)
  const body = formatDream(tId, 'Keisya', dream)
  assert.match(body, /DREAM WORLD/)
  assert.ok(body.includes('Keisya'))
  assert.ok(body.includes(dream.message))
})

test('mimpi: handler mengirim bacaan mimpi untuk nama', async () => {
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { text: 'Keisya' })
  await mimpiHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /DREAM WORLD/)
  assert.ok(text.includes('Keisya'))
})

/* ---------------- moveon ---------------- */

test('moveon: satu pesan utuh berisi semua langkah dan satu alasan gagal', async () => {
  const body = formatMoveon(tId, MOVEON_FAIL_REASONS[0])
  for (const step of ['moveon.exe', 'mantan.jpg', 'tawa.mp3', 'chat_kita.txt', 'Restart sistem perasaan', 'Verifikasi status']) {
    assert.ok(body.includes(step), `langkah hilang: ${step}`)
  }
  assert.ok(body.includes(MOVEON_FAIL_REASONS[0]))
  assert.equal(MOVEON_STEPS.length, 16)
  assert.equal(MOVEON_FAIL_REASONS.length, 10)

  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await moveonHandler(ctx)
  assert.equal(replies.length, 0, 'moveon tidak boleh spam banyak pesan')
  assert.equal(sent.length, 1, 'moveon harus tepat satu pesan')
  const text = allText(sent, replies)
  assert.match(text, /MOVEON\.EXE/)
  assert.ok(MOVEON_FAIL_REASONS.some((r) => text.includes(r)))
})

/* ---------------- renungan ---------------- */

test('renungan: daftar 20+ kutipan dan handler mengirim kartu PNG', async () => {
  assert.ok(RENUNGAN_QUOTES.length >= 20)
  assert.equal(pickRenunganQuote(() => 0), RENUNGAN_QUOTES[0])
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await renunganHandler(ctx)
  assert.equal(sent.length, 1)
  assert.ok(Buffer.isBuffer(sent[0].content.image))
  assert.ok(sent[0].content.image.subarray(0, 4).equals(PNG_MAGIC), 'kartu renungan harus PNG valid')
  assert.match(sent[0].content.caption, /RENUNGAN/)
  assert.ok(RENUNGAN_QUOTES.some((q) => sent[0].content.caption.includes(q)))
})

/* ---------------- seberapagila ---------------- */

test('seberapagila: persen acak dan jenjang komentar mengikuti tingkat', () => {
  assert.equal(tierFor(0), 0)
  assert.equal(tierFor(15), 0)
  assert.equal(tierFor(16), 1)
  assert.equal(tierFor(55), 2)
  assert.equal(tierFor(75), 3)
  assert.equal(tierFor(90), 4)
  assert.equal(tierFor(91), 5)
  assert.equal(tierFor(100), 5)
  assert.deepEqual(drawCrazy(() => 0), { percent: 0, tier: 0 })
  assert.deepEqual(drawCrazy(() => 0.9999), { percent: 100, tier: 5 })
  assert.equal(seberapagilaI18n.id.seberapagila.comments.length, 6)
})

test('seberapagila: handler mengirim persen dan komentar setingkatnya', async () => {
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { text: 'Budi' })
  await seberapagilaHandler(ctx)
  const text = allText(sent, replies)
  assert.match(text, /TES KEGILAAN HARI INI/)
  const m = text.match(/\*(\d+)%\*/)
  assert.ok(m, 'persen harus tampil')
  const percent = Number(m[1])
  const expectedComment = seberapagilaI18n.id.seberapagila.comments[tierFor(percent)]
  assert.ok(text.includes(expectedComment), 'komentar harus sesuai jenjang persen')
})

/* ---------------- tebakumur ---------------- */

test('tebakumur: 11 bacaan umur, nama wajib, handler menebak acak', async () => {
  assert.equal(AGE_READINGS.length, 11)
  assert.equal(pickAgeReading(() => 0), AGE_READINGS[0])
  const { sock } = fakeSock()
  const empty = fakeCtx(sock)
  await tebakumurHandler(empty.ctx)
  assert.match(empty.replies[0], /TEBAK UMUR/)
  const { sock: sock2, sent } = fakeSock()
  const named = fakeCtx(sock2, { text: 'Budi' })
  await tebakumurHandler(named.ctx)
  const text = allText(sent, named.replies)
  assert.match(text, /TEBAK UMUR/)
  assert.ok(text.includes('Budi'))
  assert.ok(AGE_READINGS.some((r) => text.includes(r)))
})
