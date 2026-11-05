import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCanvas } from '@napi-rs/canvas'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say as sayPersona } from '../src/persona/moe.js'
import {
  parseArtiNama,
  parseRamalanJodoh,
  hitungWeton,
  kategoriNeptu,
  ramalanWetonLokal,
} from '../src/scrapers/search/primbon.js'
import { i18n as artinamaI18n, formatArtiNama, test as artinamaTest } from '../plugins/fun/artinama.js'
import {
  i18n as ramalanI18n,
  parseRamalanArgs,
  formatRamalanApi,
  formatRamalanLokal,
  test as ramalanTest,
} from '../plugins/primbon/ramalanjodoh.js'
import { dispatchReply, getReplyBinding } from '../src/ui/reply-router.js'
import {
  i18n as randomtagI18n,
  handler as randomtagHandler,
  memberJids as groupMemberJids,
  pickRandomMember,
} from '../plugins/fun/randomtag.js'
import {
  i18n as jodohI18n,
  handler as jodohHandler,
  pickPair,
  statusIndex,
  heartsFor,
  progressBar,
} from '../plugins/fun/jodoh.js'
import {
  i18n as cekpacarI18n,
  handler as cekpacarHandler,
  resolvePartnerTarget,
} from '../plugins/fun/cekpacar.js'
import {
  i18n as sulapI18n,
  handler as sulapHandler,
  findParticipant,
} from '../plugins/fun/sulap.js'
import { renderShipCard, SHIP_CARD_WIDTH, SHIP_CARD_HEIGHT } from '../src/ui/ship-card.js'
import {
  i18n as shipI18n,
  handler as shipHandler,
  resolveShipPair,
  pickPercent,
} from '../plugins/canvas/ship.js'
import {
  i18n as usercardI18n,
  handler as usercardHandler,
  resolveUsercardTarget,
  rankKeyForLevel,
} from '../plugins/main/usercard.js'
import { PNG } from 'pngjs'
import { imageKind, parseMattePng, removeBackground } from '../src/scrapers/maker/removebg.js'
import {
  i18n as removebgI18n,
  handler as removebgHandler,
  fetchSourceImage,
} from '../plugins/maker/removebg.js'
import {
  parseSafebooruPosts,
  getRandomBlueArchiveImage,
  getRandomCosplayImage,
} from '../src/scrapers/random/bluearchive.js'
import { parseRandomQuote } from '../src/scrapers/search/quotes.js'
import { quoteCard } from '../src/ui/cards.js'
import { parsePoemLinks, parsePoemPage } from '../src/scrapers/search/puisi.js'
import { parseHorrorArticles } from '../src/scrapers/search/misteri.js'
import {
  i18n as puisiI18n,
  formatPuisi,
  test as puisiTest,
} from '../plugins/fun/puisi.js'
import {
  WAIFU_LIST,
  drawGacha,
  formatGacha,
  i18n as gachabiniI18n,
} from '../plugins/fun/gachabini.js'

for (const mod of [artinamaI18n, ramalanI18n, randomtagI18n, jodohI18n, cekpacarI18n, sulapI18n, shipI18n, usercardI18n, removebgI18n, puisiI18n, gachabiniI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}

export const tId = (k, vars) => translate('id', k, vars)
export const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
export const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])

export function fakeStorage() {
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

export function fakeSock(extra = {}) {
  const sent = []
  const removed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: `MSG${sent.length}` } }
    },
    relayMessage: async () => ({}),
    groupParticipantsUpdate: async (jid, participants, action) => {
      removed.push({ jid, participants, action })
      return []
    },
    profilePictureUrl: async () => null,
    ...extra,
  }
  return { sock, sent, removed }
}

export function fakeCtx(sock, over = {}) {
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

export function tinyPngBuffer() {
  const canvas = createCanvas(24, 24)
  const c = canvas.getContext('2d')
  c.fillStyle = '#00a884'
  c.fillRect(0, 0, 24, 24)
  return canvas.toBuffer('image/png')
}

/* ---------------- Primbon: Siputzx + weton lokal ---------------- */

test('primbon: parseArtiNama mengambil arti dan catatan asli', () => {
  const parsed = parseArtiNama({
    status: true,
    data: { nama: 'Budi', arti: 'Peduli sesama, dermawan.', catatan: 'Arti bersifat umum.' },
  })
  assert.equal(parsed.nama, 'Budi')
  assert.match(parsed.arti, /dermawan/)
  assert.equal(parseArtiNama({ status: false }), null)
  const body = formatArtiNama(tId, parsed)
  assert.match(body, /ARTI NAMA PRIMBON/)
  assert.match(body, /dermawan/)
  assert.ok(artinamaTest.expect.test(body))
})

test('primbon: parseRamalanJodoh memetakan weton dan hasil ramalan', () => {
  const parsed = parseRamalanJodoh({
    status: true,
    data: {
      peringatan: 'Hanya hiburan.',
      result: {
        orang_pertama: { nama: 'Putu', tanggal_lahir: 'Jumat Pahing, 16 November 2007' },
        orang_kedua: { nama: 'Keyla', tanggal_lahir: 'Selasa Pon, 1 Januari 2008' },
        hasil_ramalan: ['Baris satu.', 'Baris dua.'],
      },
    },
  })
  assert.equal(parsed.first.tanggalLahir, 'Jumat Pahing, 16 November 2007')
  assert.equal(parsed.hasil.length, 2)
  const body = formatRamalanApi(tId, parsed)
  assert.match(body, /RAMALAN JODOH PRIMBON/)
  assert.match(body, /Jumat Pahing/)
  assert.ok(ramalanTest.expect.test(body))
})

test('primbon: hitungWeton cocok dengan data Siputzx untuk dua tanggal contoh', () => {
  const w1 = hitungWeton(2007, 11, 16)
  assert.deepEqual(w1, { hari: 'Jumat', pasaran: 'Pahing', neptu: 15 })
  const w2 = hitungWeton(2008, 1, 1)
  assert.deepEqual(w2, { hari: 'Selasa', pasaran: 'Pon', neptu: 10 })
  assert.equal(hitungWeton(2026, 2, 31), null, '31 Februari bukan tanggal nyata')
})

test('primbon: kategoriNeptu mengikuti tabel delapan kategori', () => {
  assert.equal(kategoriNeptu(18), 'Pegat')
  assert.equal(kategoriNeptu(20), 'Ratu')
  assert.equal(kategoriNeptu(21), 'Jodoh')
  assert.equal(kategoriNeptu(22), 'Topo')
  assert.equal(kategoriNeptu(23), 'Tinari')
  assert.equal(kategoriNeptu(24), 'Padu')
  assert.equal(kategoriNeptu(25), 'Sujanan')
  assert.equal(kategoriNeptu(26), 'Pesthi')
})

test('primbon: ramalan lokal menjumlah neptu dua weton dan formatnya substantif', () => {
  const input = parseRamalanArgs(['Putu', '16', '11', '2007', 'Keyla', '1', '1', '2008'])
  assert.equal(input.nama1, 'Putu')
  const local = ramalanWetonLokal(input)
  assert.equal(local.total, 25)
  assert.equal(local.kategori, 'Sujanan')
  const body = formatRamalanLokal(tId, local)
  assert.match(body, /Jumat Pahing/)
  assert.match(body, /Selasa Pon/)
  assert.match(body, /Sujanan/)
  assert.equal(parseRamalanArgs(['Putu', '16', '11']), null)
  assert.equal(parseRamalanArgs(['A', '31', '2', '2007', 'B', '1', '1', '2008']).invalidDate, true)
})

/* ---------------- Grup sosial: randomtag, jodoh, cekpacar, sulap ---------------- */

const GROUP_PARTICIPANTS = [
  { id: '628201@s.whatsapp.net' },
  { phoneNumber: '628202@s.whatsapp.net', id: '777002@lid' },
  { id: '628203@s.whatsapp.net', admin: 'admin' },
  { id: '6285187605007@s.whatsapp.net' }, // bot
  { id: '628201@s.whatsapp.net' }, // duplikat
]

test('randomtag: memberJids menyaring bot, duplikat, dan memakai phoneNumber', () => {
  const members = groupMemberJids(GROUP_PARTICIPANTS, '6285187605007@s.whatsapp.net')
  assert.deepEqual(members, ['628201@s.whatsapp.net', '628202@s.whatsapp.net', '628203@s.whatsapp.net'])
  assert.equal(pickRandomMember(GROUP_PARTICIPANTS, { botJid: '6285187605007@s.whatsapp.net', rng: () => 0 }), '628201@s.whatsapp.net')
})

test('randomtag: handler mengirim satu mention beneran dari member grup', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, { groupMetadata: { participants: GROUP_PARTICIPANTS } })
  await randomtagHandler(ctx)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].content.mentions.length, 1)
  assert.ok(sent[0].content.text.includes(`@${sent[0].content.mentions[0].split('@')[0]}`))
  assert.match(sent[0].content.text, /RANDOM TAG/)
})

test('jodoh: pickPair memilih dua member berbeda selain bot', () => {
  const pair = pickPair(GROUP_PARTICIPANTS, { botJid: '6285187605007@s.whatsapp.net', rng: () => 0.3 })
  assert.equal(pair.length, 2)
  assert.notEqual(pair[0], pair[1])
  assert.ok(!pair.some((j) => j.startsWith('6285187605007@')))
  assert.equal(statusIndex(95), 4)
  assert.equal(heartsFor(95), '💕💕💕💕💕')
  assert.equal(progressBar(50), '█████░░░░░')
})

test('jodoh: handler mengirim pasangan dengan dua mentions dan persen', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, { groupMetadata: { participants: GROUP_PARTICIPANTS } })
  await jodohHandler(ctx)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].content.mentions.length, 2)
  assert.notEqual(sent[0].content.mentions[0], sent[0].content.mentions[1])
  assert.match(sent[0].content.text, /JODOH RANDOM/)
  assert.match(sent[0].content.text, /Kecocokan: \*\d+%/)
  for (const jid of sent[0].content.mentions) assert.ok(sent[0].content.text.includes(`@${jid.split('@')[0]}`))
})

test('cekpacar: target dari mention, kutipan, nomor, lalu diri sendiri', () => {
  const base = { sender: '628111@s.whatsapp.net', mentionedJids: [], quoted: null, args: [] }
  assert.equal(resolvePartnerTarget({ ...base, quoted: { sender: '628222@s.whatsapp.net' } }).jid, '628222@s.whatsapp.net')
  assert.equal(resolvePartnerTarget({ ...base, mentionedJids: ['628333@s.whatsapp.net'] }).jid, '628333@s.whatsapp.net')
  assert.equal(resolvePartnerTarget({ ...base, args: ['628444'] }).jid, '628444@s.whatsapp.net')
  assert.equal(resolvePartnerTarget(base).isOther, false)
})

test('cekpacar: belum ada data berarti jawaban jujur belum punya pasangan', async () => {
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock)
  await cekpacarHandler(ctx)
  assert.match(replies[0], /belum punya pasangan/)
  assert.match(replies[0], /nembak/)
})

test('cekpacar: data couples timbal balik terbaca sebagai pacaran beserta durasi', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock)
  const since = Date.now() - 10 * 86400000
  await ctx.storage.set('couples', '628111', { partner: '628222', since })
  await ctx.storage.set('couples', '628222', { partner: '628111', since })
  await cekpacarHandler(ctx)
  assert.equal(sent.length, 1)
  assert.match(sent[0].content.text, /sedang pacaran dengan \*@628222\*/)
  assert.match(sent[0].content.text, /10 hari/)
  assert.deepEqual(sent[0].content.mentions, ['628111@s.whatsapp.net', '628222@s.whatsapp.net'])
})

test('cekpacar: data satu arah terbaca sebagai menunggu jawaban', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await ctx.storage.set('couples', '628111', { partner: '628222', since: Date.now() })
  await cekpacarHandler(ctx)
  assert.match(sent[0].content.text, /menunggu jawaban/)
})

test('sulap: findParticipant cocok di phoneNumber dan tahu admin', () => {
  const found = findParticipant(GROUP_PARTICIPANTS, '628202@s.whatsapp.net')
  assert.equal(found.phoneNumber, '628202@s.whatsapp.net')
  assert.equal(findParticipant(GROUP_PARTICIPANTS, '628203@s.whatsapp.net').admin, 'admin')
  assert.equal(findParticipant(GROUP_PARTICIPANTS, '628999@s.whatsapp.net'), null)
})

test('sulap: alur penuh prompt lalu reply mention mengeluarkan target', async () => {
  const storage = fakeStorage()
  const participants = [
    { id: '628111@s.whatsapp.net', admin: 'admin' },
    { id: '628222@s.whatsapp.net' },
    { id: '6285187605007@s.whatsapp.net', admin: 'admin' },
  ]
  const { sock, sent, removed } = fakeSock()
  const start = fakeCtx(sock, { storage, groupMetadata: { participants } })
  await sulapHandler(start.ctx)
  assert.match(sent[0].content.text, /PERTUNJUKAN SULAP/)
  const binding = await getReplyBinding(storage, start.ctx.chat)
  assert.equal(binding?.kind, 'sulap')

  const answer = fakeCtx(sock, {
    storage,
    groupMetadata: { participants },
    quoted: { stanzaId: 'MSG1', sender: '6285187605007@s.whatsapp.net' },
    text: '@628222',
    mentionedJids: ['628222@s.whatsapp.net'],
  })
  const consumed = await dispatchReply(answer.ctx)
  assert.equal(consumed, false, 'reply harus dikonsumsi router')
  assert.deepEqual(removed, [{ jid: answer.ctx.chat, participants: ['628222@s.whatsapp.net'], action: 'remove' }])
  const success = sent.at(-1)
  assert.match(success.content.text, /SULAP SELESAI/)
  assert.ok(success.content.mentions.includes('628222@s.whatsapp.net'))
  assert.equal(await getReplyBinding(storage, start.ctx.chat), null, 'sesi harus tertutup')
})

test('sulap: target admin kebal dan tidak dikeluarkan', async () => {
  const storage = fakeStorage()
  const participants = [
    { id: '628111@s.whatsapp.net', admin: 'admin' },
    { id: '628333@s.whatsapp.net', admin: 'superadmin' },
  ]
  const { sock, sent, removed } = fakeSock()
  const start = fakeCtx(sock, { storage, groupMetadata: { participants } })
  await sulapHandler(start.ctx)
  const answer = fakeCtx(sock, {
    storage,
    groupMetadata: { participants },
    quoted: { stanzaId: 'MSG1', sender: '6285187605007@s.whatsapp.net' },
    text: '@628333',
    mentionedJids: ['628333@s.whatsapp.net'],
  })
  await dispatchReply(answer.ctx)
  assert.equal(removed.length, 0)
  assert.match(sent.at(-1).content.text, /kebal/)
})

/* ---------------- Canvas: ship dan usercard ---------------- */

test('ship-card: render menghasilkan PNG valid 800x400, placeholder maupun berfoto', async () => {
  const plain = await renderShipCard({ name1: 'Budi', name2: 'Ani', percent: 73, title: 'SHIP' })
  assert.ok(plain.subarray(0, 4).equals(PNG_MAGIC))
  assert.equal(plain.readUInt32BE(16), SHIP_CARD_WIDTH)
  assert.equal(plain.readUInt32BE(20), SHIP_CARD_HEIGHT)
  assert.ok(plain.length > 10000, `PNG terlalu kecil: ${plain.length}`)
  const withPhoto = await renderShipCard({
    name1: 'Budi',
    name2: 'Ani',
    percent: 73,
    avatar1Buffer: tinyPngBuffer(),
    avatar2Buffer: tinyPngBuffer(),
  })
  assert.ok(withPhoto.subarray(0, 4).equals(PNG_MAGIC))
  assert.notEqual(withPhoto.length, plain.length, 'kartu berfoto harus beda dari placeholder')
})

test('ship: resolveShipPair dari dua mention atau pengirim plus satu mention', () => {
  const base = { sender: '628111@s.whatsapp.net', mentionedJids: [] }
  assert.deepEqual(
    resolveShipPair({ ...base, mentionedJids: ['628222@s.whatsapp.net', '628333@s.whatsapp.net'] }),
    ['628222@s.whatsapp.net', '628333@s.whatsapp.net']
  )
  assert.deepEqual(resolveShipPair({ ...base, mentionedJids: ['628222@s.whatsapp.net'] }), [
    '628111@s.whatsapp.net',
    '628222@s.whatsapp.net',
  ])
  assert.equal(resolveShipPair(base), null)
  assert.equal(pickPercent(() => 0.5), 50)
})

test('ship: handler mengirim gambar PNG valid dengan caption persen dan mentions', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, { mentionedJids: ['628222@s.whatsapp.net', '628333@s.whatsapp.net'] })
  await shipHandler(ctx)
  assert.equal(sent.length, 1)
  const { content } = sent[0]
  assert.ok(Buffer.isBuffer(content.image))
  assert.ok(content.image.subarray(0, 4).equals(PNG_MAGIC), 'gambar ship harus PNG valid')
  assert.match(content.caption, /SHIP RESULT/)
  assert.match(content.caption, /Kecocokan: \*\d+%/)
  assert.deepEqual(content.mentions, ['628222@s.whatsapp.net', '628333@s.whatsapp.net'])
})

test('usercard: resolveUsercardTarget mengutamakan mention, kutipan, nomor, diri', () => {
  const base = { sender: '628111@s.whatsapp.net', mentionedJids: [], quoted: null, args: [] }
  assert.equal(resolveUsercardTarget({ ...base, mentionedJids: ['628222@s.whatsapp.net'] }), '628222@s.whatsapp.net')
  assert.equal(resolveUsercardTarget({ ...base, quoted: { sender: '628333@s.whatsapp.net' } }), '628333@s.whatsapp.net')
  assert.equal(resolveUsercardTarget({ ...base, args: ['628444'] }), '628444@s.whatsapp.net')
  assert.equal(resolveUsercardTarget(base), '628111@s.whatsapp.net')
  assert.equal(rankKeyForLevel(30), 'usercard.rank5')
})

test('usercard: handler mengirim kartu profil sebagai gambar PNG berisi data user', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await ctx.storage.set('users', '628111', {
    xp: 2450,
    balance: 12500,
    name: 'Penguji Hebat',
    registered: true,
    registeredAt: '2026-10-02T00:00:00.000Z',
  })
  await usercardHandler(ctx)
  assert.equal(sent.length, 1)
  const { content } = sent[0]
  assert.ok(Buffer.isBuffer(content.image), 'usercard harus mengirim gambar')
  assert.ok(content.image.subarray(0, 4).equals(PNG_MAGIC), 'gambar usercard harus PNG valid')
  assert.equal(content.image.readUInt32BE(16), 1000)
  assert.equal(content.image.readUInt32BE(20), 560)
  assert.match(content.caption, /USERCARD/)
  assert.match(content.caption, /Penguji Hebat/)
  assert.match(content.caption, /12500/)
  assert.deepEqual(content.mentions, ['628111@s.whatsapp.net'])
})

/* ---------------- Media: removebg, barandom, cosba, quotesimage ---------------- */

test('removebg: imageKind membaca magic bytes dan parseMattePng menuntut alpha', () => {
  assert.equal(imageKind(tinyPngBuffer()), 'png')
  assert.equal(imageKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])), 'jpeg')
  assert.equal(imageKind(Buffer.from('ini teks biasa yang panjang')), null)
  const parsed = parseMattePng(tinyPngBuffer())
  assert.ok(parsed, 'PNG canvas RGBA harus lolos validasi alpha')
  assert.equal(parsed.width, 24)
  const rgb = new PNG({ width: 2, height: 2 })
  rgb.data = Buffer.alloc(2 * 2 * 4, 128)
  assert.equal(parseMattePng(PNG.sync.write(rgb, { colorType: 2 })), null, 'PNG tanpa alpha harus ditolak')
})

test('removebg: removeBackground mengirim multipart dan memvalidasi hasil', async () => {
  const png = tinyPngBuffer()
  let seenUrl = ''
  let seenBody = null
  const okFetch = async (url, opts) => {
    seenUrl = url
    seenBody = opts.body
    return { ok: true, status: 200, arrayBuffer: async () => png }
  }
  const out = await removeBackground(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6, 7, 8]), { fetchImpl: okFetch })
  assert.ok(out.equals(png))
  assert.match(seenUrl, /pixelcut\.app\/image\/matte\/v1/)
  assert.ok(seenBody instanceof FormData)
  const badFetch = async () => ({
    ok: false,
    status: 400,
    arrayBuffer: async () => Buffer.from(JSON.stringify({ error: 'gambar terlalu kecil' })),
  })
  await assert.rejects(() => removeBackground(tinyPngBuffer(), { fetchImpl: badFetch }), /HTTP 400/)
  await assert.rejects(() => removeBackground(Buffer.from('bukan gambar sama sekali')), /bukan gambar/)
})

test('removebg: handler menolak tanpa gambar dan berkas bukan gambar', async () => {
  const { sock } = fakeSock()
  const noImage = fakeCtx(sock)
  await removebgHandler(noImage.ctx)
  assert.match(noImage.replies[0], /HAPUS LATAR/)

  const withText = fakeCtx(sock, {
    quoted: { sender: '628111@s.whatsapp.net', stanzaId: 'Q1', message: { imageMessage: {} } },
    downloadQuoted: async () => Buffer.from('ini bukan gambar'),
  })
  await removebgHandler(withText.ctx)
  assert.match(withText.replies[0], /BUKAN GAMBAR/)
  const src = await fetchSourceImage(withText.ctx)
  assert.ok(Buffer.isBuffer(src))
})

test('barandom: getRandomBlueArchiveImage memvalidasi magic bytes dari respons', async () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3])
  const fetchImpl = async () => ({ ok: true, status: 200, arrayBuffer: async () => jpeg })
  const { buffer, kind } = await getRandomBlueArchiveImage({ fetchImpl })
  assert.equal(kind, 'jpeg')
  assert.ok(buffer.equals(jpeg))
  const badFetch = async () => ({ ok: true, status: 200, arrayBuffer: async () => Buffer.from('teks saja') })
  await assert.rejects(() => getRandomBlueArchiveImage({ fetchImpl: badFetch }), /tidak mengembalikan gambar/)
})

test('cosba: parseSafebooruPosts hanya mengambil pos cosplay Blue Archive bergambar', () => {
  const posts = parseSafebooruPosts([
    { id: 1, tags: 'blue_archive cosplay rating:safe', file_url: 'https://safebooru.org/images/1/a.jpg' },
    { id: 2, tags: 'blue_archive rating:safe', file_url: 'https://safebooru.org/images/2/b.jpg' },
    { id: 3, tags: 'other cosplay', file_url: 'https://safebooru.org/images/3/c.jpg' },
    { id: 4, tags: 'blue_archive cosplay', file_url: 'http://insecure.example/d.jpg' },
  ])
  assert.deepEqual(posts.map((p) => p.id), [1])
})

test('cosba: getRandomCosplayImage mengunduh kandidat dan memeriksa magic bytes', async () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 9, 9, 9, 9, 9, 9, 9, 9])
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => [{ id: 42, tags: 'blue_archive cosplay rating:safe', file_url: 'https://safebooru.org/images/42/x.jpg' }],
  })
  const download = async () => ({ buffer: jpeg })
  const out = await getRandomCosplayImage({ fetchImpl, download, rng: () => 0 })
  assert.equal(out.kind, 'jpeg')
  assert.match(out.postUrl, /id=42/)
})

test('quotesimage: parseRandomQuote dan quoteCard menghasilkan PNG valid', async () => {
  const parsed = parseRandomQuote({ quote: 'The desire to know your own soul will end all other desires.', author: 'Rumi' })
  assert.equal(parsed.author, 'Rumi')
  assert.equal(parseRandomQuote({ quote: '' }), null)
  const image = await quoteCard({ text: parsed.quote, author: parsed.author })
  assert.ok(image.subarray(0, 4).equals(PNG_MAGIC), 'kartu quotes harus PNG valid')
  assert.ok(image.length > 5000)
})

/* ---------------- Teks data: puisi, misteri, gachabini ---------------- */

test('puisi: parsePoemLinks mengumpulkan tautan puisi unik dari beranda', () => {
  const html = `
    <a href="https://puisipendek.net/puisi/suaraku-di-angkasa">a</a>
    <a href="https://puisipendek.net/puisi/suaraku-di-angkasa">duplikat</a>
    <a href="https://puisipendek.net/puisi/hening-senja">b</a>
    <a href="https://puisipendek.net/about-us">bukan puisi</a>`
  assert.deepEqual(parsePoemLinks(html), [
    'https://puisipendek.net/puisi/suaraku-di-angkasa',
    'https://puisipendek.net/puisi/hening-senja',
  ])
})

test('puisi: parsePoemPage mengekstrak judul dan puisi multi-baris', () => {
  const html = `
    <html><head><meta property="og:title" content="Suaraku di Angkasa ~ PuisiPendek.net"></head>
    <body><div class="entry-content"><p>Setiap detik namamu terucap,<br>
    Di antara bintang yang berkelip,<br>
    Di atas langit biru yang luas.</p></div></body></html>`
  const poem = parsePoemPage(html, 'https://puisipendek.net/puisi/suaraku-di-angkasa')
  assert.equal(poem.title, 'Suaraku di Angkasa')
  assert.equal(poem.text.split('\n').length, 3)
  const body = formatPuisi(tId, poem, 'moe~')
  assert.match(body, /Suaraku di Angkasa/)
  assert.match(body, /Sumber: https:\/\/puisipendek\.net/)
  assert.ok(puisiTest.expect.test(body))
  assert.equal(parsePoemPage('<div class="entry-content"><p>satu baris saja</p></div>', 'x'), null)
})

test('misteri: parseHorrorArticles mengambil judul, tautan, dan gambar artikel', () => {
  const link = 'https://www.idntimes.com/hype/entertainment/5-mitos-gunung-arjuno-makin-terasa-mistis-68bc4412e01140a45edcfbbcbf93d7ed'
  const html = `
    <a href="${link}"><img src="https://image.idntimes.com/post/20231007/misteri-gunung-arjuno-68bc4412e01140a45edcfbbcbf93d7ed.png" alt="5 Mitos Gunung Arjuno, Makin Terasa Mistis dan Keramat"></a>
    <img src="https://image.idntimes.com/monorepo/assets/idn-times-logo.svg" alt="IDN Times logo">`
  const articles = parseHorrorArticles(html)
  assert.equal(articles.length, 1)
  assert.equal(articles[0].link, link)
  assert.match(articles[0].title, /Gunung Arjuno/)
  assert.match(articles[0].image, /^https:\/\/image\.idntimes\.com\//)
})

test('gachabini: daftar waifu besar dan tarikan gacha bervariasi mengikuti rng', () => {
  assert.ok(WAIFU_LIST.length >= 150, `daftar waifu terlalu kecil: ${WAIFU_LIST.length}`)
  assert.ok(WAIFU_LIST.includes('Rem'))
  assert.ok(WAIFU_LIST.includes('Frieren'))
  const first = drawGacha(() => 0)
  assert.equal(first.waifu, 'Rimuru')
  assert.equal(first.love, 0)
  const last = drawGacha(() => 0.9999)
  assert.equal(last.waifu, WAIFU_LIST[WAIFU_LIST.length - 1])
  assert.equal(last.love, 100)
  const pack = gachabiniI18n.id.gachabini
  const body = formatGacha(tId, pack, 'Penguji', first)
  assert.match(body, /GACHA BINI/)
  assert.match(body, /Rimuru/)
  assert.match(body, /Cinta Sejati/)
})
