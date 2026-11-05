import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listGames } from '../src/services/game-catalog.js'
import { buildGameRelay, toGameFragment } from '../src/ui/htmlgame.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { handler as gameHandler, i18n as gameI18n } from '../plugins/game/game.js'
import { handler as helloHandler, i18n as helloI18n } from '../plugins/main/game.js'

for (const mod of [gameI18n, helloI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}
// Tanpa SCORE_WS_PORT, handler .game tidak menyalakan server skor dan
// vars ws bernilai null, sama seperti pola di test/fase3-engine.test.js.
delete process.env.SCORE_WS_PORT

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

function fakeSock() {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
    relayMessage: async (jid, message, opts) => {
      relayed.push({ jid, message, opts })
      return {}
    },
  }
  return { sock, sent, relayed }
}

function fakeCtx(sock, { args = [], storage } = {}) {
  const replies = []
  const ctx = {
    sock,
    chat: '628123@s.whatsapp.net',
    sender: '628123@s.whatsapp.net',
    senderDigits: '628123',
    pushName: 'Senpai',
    isGroup: false,
    isOwner: false,
    args,
    text: args.join(' '),
    command: '',
    lang: 'id',
    raw: { pushName: 'Senpai' },
    t: (k, vars) => translate('id', k, vars),
    say: (mood) => say('id', mood),
    reply: async (txt) => {
      replies.push(txt)
    },
    storage: storage ?? fakeStorage(),
    registry: { list: () => [], resolve: () => undefined, quarantined: [] },
  }
  return { ctx, replies }
}

// Kumpulkan semua objek contextInfo di dalam satu node pesan, di mana pun
// ia bersarang (botForwardedMessage, richResponseMessage, dan seterusnya).
function collectContextInfos(node, out = []) {
  if (!node || typeof node !== 'object' || Buffer.isBuffer(node)) return out
  for (const [key, value] of Object.entries(node)) {
    if (key === 'contextInfo' && value && typeof value === 'object') out.push(value)
    else collectContextInfos(value, out)
  }
  return out
}

// contextInfo milik payload game HTML: hanya dari relay yang membawa
// botForwardedMessage berisi richResponseMessage, bukan dari pesan tombol
// susulan yang juga ter-relay oleh handler .game.
function gameContextInfos(relayed) {
  const infos = []
  for (const r of relayed) {
    const forwarded = r.message?.botForwardedMessage
    if (!forwarded?.message?.richResponseMessage) continue
    infos.push(...collectContextInfos(forwarded))
  }
  return infos
}

function assertForwarded(relayed, gameId) {
  const infos = gameContextInfos(relayed)
  assert.ok(infos.length >= 1, `game ${gameId}: tidak ada contextInfo pada payload relay game HTML`)
  const info = infos[0]
  assert.equal(info.isForwarded, true, `game ${gameId}: contextInfo.isForwarded harus true`)
  assert.ok(
    typeof info.forwardingScore === 'number' && info.forwardingScore >= 1,
    `game ${gameId}: contextInfo.forwardingScore harus >= 1, dapat ${info.forwardingScore}`
  )
  assert.ok(
    info.forwardedAiBotMessageInfo && typeof info.forwardedAiBotMessageInfo === 'object',
    `game ${gameId}: contextInfo.forwardedAiBotMessageInfo harus ada`
  )
  assert.ok(
    info.forwardedAiBotMessageInfo.botJid,
    `game ${gameId}: forwardedAiBotMessageInfo.botJid harus terisi`
  )
  return info
}

const games = await listGames()

test('katalog game tidak kosong dan memuat hello', () => {
  assert.ok(games.length >= 1, 'katalog games/ kosong')
  assert.ok(
    games.some((g) => g.id === 'hello'),
    'game hello harus ada di katalog'
  )
})

// Satu tes per game dari katalog yang sama seperti yang dimuat .game/.games,
// lewat jalur handler .game nyata dengan sock palsu penangkap relayMessage.
for (const game of games) {
  test(`forwarded: .game ${game.id} terkirim dengan penanda diteruskan`, async () => {
    const { sock, relayed } = fakeSock()
    const { ctx, replies } = fakeCtx(sock, { args: [game.id] })
    await gameHandler(ctx)
    assert.equal(replies.length, 0, `game ${game.id}: handler jatuh ke balasan error: ${replies[0] ?? ''}`)
    assertForwarded(relayed, game.id)
  })
}

// Jalur kedua: .hello memakai sendHtmlGame (bukan sendGameWithVars),
// penanda diteruskannya harus terbukti juga.
test('forwarded: .hello (sendHtmlGame) terkirim dengan penanda diteruskan', async () => {
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await helloHandler(ctx)
  assertForwarded(relayed, 'hello (.hello)')
})

// Struktur payload harus persis bentuk varian RYO-YAMADA (format C).
// Format A ala Elaina (tanpa messageContextInfo, botJid Meta AI,
// trusted_sources terisi, messageId sama dengan response_id) dan
// format B ala pain-bot (botMetadata lengkap dengan
// verificationMetadata acak) sama-sama divonis placeholder oleh owner;
// format C tampil jadi game beneran (vonis owner 2026-11-05 23:24 WIB).
function decodeGameData(relay) {
  const rich = relay.content.botForwardedMessage.message.richResponseMessage
  return { rich, data: JSON.parse(Buffer.from(rich.unifiedResponse.data, 'base64').toString('utf8')) }
}

test('payload game: struktur relay varian RYO-YAMADA (format C)', () => {
  const doc = '<!doctype html><html><head><meta charset="utf-8"><style>.a{color:red}</style></head><body><div id="wrap">Halo</div><script>var x=1;</script></body></html>'
  const relay = buildGameRelay('628123@s.whatsapp.net', { title: 'KANA Block Blast', html: doc, height: 520, responseId: 'resp-123' })

  // Content membawa messageContextInfo di level atas, mendampingi
  // botForwardedMessage yang tetap HANYA berisi message.
  assert.deepEqual(Object.keys(relay.content).sort(), ['botForwardedMessage', 'messageContextInfo'])
  assert.deepEqual(Object.keys(relay.content.botForwardedMessage), ['message'])

  // botMetadata ramping gaya RYO: messageDisclaimerText kosong dan
  // botResponseId UUID tersendiri, TANPA verificationMetadata.
  const mci = relay.content.messageContextInfo
  assert.deepEqual(mci.deviceListMetadata, {})
  assert.equal(mci.deviceListMetadataVersion, 2)
  assert.deepEqual(Object.keys(mci.botMetadata).sort(), ['botResponseId', 'messageDisclaimerText'])
  assert.equal(mci.botMetadata.messageDisclaimerText, '')
  assert.match(mci.botMetadata.botResponseId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)

  // Tidak ada verificationMetadata dan tidak ada externalAdReply di
  // mana pun dalam relay (aturan proyek: externalAdReply dilarang).
  const serialized = JSON.stringify(relay.content)
  assert.ok(!serialized.includes('verificationMetadata'), 'relay tidak boleh membawa verificationMetadata')
  assert.ok(!serialized.includes('externalAdReply'), 'relay tidak boleh membawa externalAdReply')

  const { rich, data } = decodeGameData(relay)
  assert.equal(rich.messageType, 1)
  assert.deepEqual(rich.submessages, [{ messageType: 2, messageText: 'KANA Block Blast' }])
  assert.equal(data.response_id, 'resp-123')
  assert.notEqual(mci.botMetadata.botResponseId, data.response_id, 'botResponseId harus berbeda dari response_id')
  // Options kosong: messageId memakai bawaan library, tidak lagi
  // dipaksa sama dengan response_id seperti format A.
  assert.deepEqual(relay.options, {})

  assert.equal(data.sections.length, 1)
  assert.equal('__typename' in data.sections[0], false, 'section tidak boleh punya __typename luar')
  const viewModel = data.sections[0].view_model
  assert.equal(viewModel.__typename, 'GenAISingleLayoutViewModel')
  const primitive = viewModel.primitive
  assert.equal(primitive.__typename, 'GenAIaeacdsnwHtmlPrimitive')
  assert.deepEqual(primitive.trusted_sources, [])

  // Payload adalah fragmen: tanpa doctype/html/head/body, style dari head
  // dan isi body (termasuk script) tetap utuh.
  assert.ok(!/<!doctype/i.test(primitive.payload))
  assert.ok(!/<\/?(?:html|head|body)\b/i.test(primitive.payload))
  assert.ok(primitive.payload.includes('<style>.a{color:red}</style>'))
  assert.ok(primitive.payload.includes('<div id="wrap">Halo</div>'))
  assert.ok(primitive.payload.includes('<script>var x=1;</script>'))
  // Payload tidak diawali tempelan apa pun: style pengunci tinggi
  // yang dulu ditempel deliverGame di depan fragmen tidak boleh kembali.
  assert.ok(!/html,body\{height:\d+px/.test(primitive.payload), 'payload tidak boleh mengandung style pengunci tinggi tempelan')

  const info = rich.contextInfo
  assert.equal(info.isForwarded, true)
  assert.equal(info.forwardingScore, 1)
  assert.equal(info.forwardedAiBotMessageInfo.botJid, '0@bot')
  assert.equal(info.forwardOrigin, 4)
  assert.equal(info.botMessageSharingInfo, undefined)
})

test('payload game: tanpa responseId eksplisit, response_id dan botResponseId dua UUID berbeda', () => {
  const relay = buildGameRelay('628123@s.whatsapp.net', { title: 'KANA Tetris', html: '<p>x</p>' })
  const { data } = decodeGameData(relay)
  assert.match(data.response_id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  const botResponseId = relay.content.messageContextInfo.botMetadata.botResponseId
  assert.match(botResponseId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  assert.notEqual(botResponseId, data.response_id)
  assert.deepEqual(relay.options, {})
})

// Perbandingan kerangka struktur melawan bentuk varian RYO-YAMADA.
// Fixture test/fixtures/ryo-game-relay-structure.json dibuat dari
// konstruksi driver uji ryostyle-driver.mjs yang bubble Tetris-nya
// divonis TAMPIL oleh owner pada 2026-11-05 23:24 WIB: semua nilai
// string diganti penanda, angka/boolean dipertahankan, payload
// diringkas jadi fitur bentuknya. Tes ini gagal bila struktur relay
// KANA menyimpang dari bentuk format C di field mana pun selain isi
// konten dan judul.
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function payloadFeatures(html) {
  const s = String(html ?? '')
  return {
    startsWithStyle: /^\s*<style/i.test(s),
    hasDoctype: /<!doctype/i.test(s),
    hasHtmlTag: /<html[\s>]/i.test(s),
    hasHeadTag: /<head[\s>]/i.test(s),
    hasBodyTag: /<body[\s>]/i.test(s),
    scriptCount: (s.match(/<script/gi) || []).length,
    hasWindowBot: s.includes('window.__BOT'),
    hasHeightLockStyle: /html,body\{height:\d+px/.test(s),
  }
}

function skeletonOf(value, key = '') {
  if (key === 'payload' && typeof value === 'string') return { $payloadFeatures: payloadFeatures(value) }
  if (typeof value === 'string') return '<string>'
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.map((v) => skeletonOf(v))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = skeletonOf(v, k)
    return out
  }
  return value
}

test('struktur relay KANA identik dengan kerangka varian RYO-YAMADA', async () => {
  const fixturePath = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'ryo-game-relay-structure.json')
  const fixture = JSON.parse(await readFile(fixturePath, 'utf8'))

  // Dokumen contoh berbentuk seperti berkas game pada umumnya: style
  // di head, satu script di body. Judul singkat dan responseId UUID.
  const doc = '<!doctype html><html><head><meta charset="utf-8"><style>.a{color:red}</style></head><body><div id="wrap">Halo</div><script>var x=1;</script></body></html>'
  const relay = buildGameRelay('628123@s.whatsapp.net', { title: 'KANA Block Blast', html: doc, responseId: 'bf4aaf35-f9a6-46dd-842f-274461319cea' })

  const { data } = decodeGameData(relay)
  // data unifiedResponse adalah string base64; ganti dengan hasil
  // dekodenya supaya kerangkanya bisa dibandingkan dengan fixture.
  assert.equal(typeof relay.content.botForwardedMessage.message.richResponseMessage.unifiedResponse.data, 'string')
  const swapData = (node, key = '') => {
    if (key === 'data' && typeof node === 'string') return { $decodedUnifiedResponse: data }
    if (Array.isArray(node)) return node.map((v) => swapData(v))
    if (node && typeof node === 'object') {
      const out = {}
      for (const [k, v] of Object.entries(node)) out[k] = swapData(v, k)
      return out
    }
    return node
  }
  const kanaContent = swapData(relay.content)

  assert.deepEqual(skeletonOf(kanaContent), fixture.content)
  assert.deepEqual(skeletonOf(relay.options), fixture.options)
})

test('toGameFragment: fragmen apa adanya dibiarkan, dokumen dipecah benar', () => {
  assert.equal(toGameFragment('<style>.x{}</style><p>hi</p>'), '<style>.x{}</style><p>hi</p>')
  const frag = toGameFragment('<!DOCTYPE html><html><head><style>s1</style><style>s2</style></head><body>B</body></html>')
  assert.equal(frag, '<style>s1</style>\n<style>s2</style>\nB')
})
