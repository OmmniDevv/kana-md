import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listGames } from '../src/services/game-catalog.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'

delete process.env.SCORE_WS_PORT

const NEW_GAMES = [
  { name: '2048', id: '2048' },
  { name: 'wordle', id: 'wordle' },
  { name: 'simon', id: 'simon' },
  { name: 'whackamole', id: 'whackamole' },
  { name: 'puzzle15', id: 'puzzle15' },
  { name: 'labirin', id: 'labirin' },
  { name: 'stack', id: 'stack' },
]

function fakeStorage() {
  const map = new Map()
  return {
    map,
    async get(ns, key) { return map.get(`${ns}:${key}`) },
    async set(ns, key, value) { map.set(`${ns}:${key}`, value) },
    async delete(ns, key) { map.delete(`${ns}:${key}`) },
    async keys(ns) { return [...map.keys()].filter((k) => k.startsWith(`${ns}:`)).map((k) => k.slice(ns.length + 1)) },
  }
}

function fakeSock() {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => { sent.push({ jid, content, opts }); return {} },
    relayMessage: async (jid, message, opts) => { relayed.push({ jid, message, opts }); return {} },
  }
  return { sock, sent, relayed }
}

function fakeCtx(sock) {
  const replies = []
  const ctx = {
    sock,
    chat: '628123@s.whatsapp.net',
    sender: '628123@s.whatsapp.net',
    senderDigits: '628123',
    pushName: 'Senpai',
    isGroup: false,
    isOwner: false,
    args: [],
    text: '',
    command: '',
    lang: 'id',
    raw: { pushName: 'Senpai' },
    t: (k, vars) => translate('id', k, vars),
    say: (mood) => say('id', mood),
    reply: async (txt) => { replies.push(txt) },
    storage: fakeStorage(),
    registry: { list: () => [], resolve: () => undefined, quarantined: [] },
  }
  return { ctx, replies }
}

const catalog = await listGames()

for (const { name, id } of NEW_GAMES) {
  test(`game html baru ${name}: terdaftar di katalog dan terkirim format C`, async () => {
    assert.ok(catalog.some((g) => g.id === id), `katalog tidak memuat ${id}`)
    const mod = await import(`../plugins/game/${name}.js`)
    assert.equal(mod.config.name, name)
    assert.equal(mod.config.category, 'game')
    for (const [lang, messages] of Object.entries(mod.i18n)) addMessages(lang, messages)
    const { sock, relayed } = fakeSock()
    const { ctx, replies } = fakeCtx(sock)
    await mod.handler(ctx)
    assert.equal(replies.length, 0, `${name}: handler jatuh ke balasan error: ${replies[0] ?? ''}`)
    const gameRelay = relayed.find((r) => r.message?.botForwardedMessage?.message?.richResponseMessage)
    assert.ok(gameRelay, `${name}: tidak ada relay game HTML`)
    const raw = JSON.stringify(gameRelay.message)
    assert.ok(!raw.includes('verificationMetadata'), `${name}: payload mengandung verificationMetadata`)
    const mci = gameRelay.message.messageContextInfo
    assert.ok(mci?.botMetadata?.botResponseId, `${name}: botMetadata.botResponseId kosong`)
    assert.equal(mci.deviceListMetadataVersion, 2)
    const rich = gameRelay.message.botForwardedMessage.message.richResponseMessage
    assert.equal(rich.contextInfo.forwardedAiBotMessageInfo.botJid, '0@bot')
    assert.equal(rich.contextInfo.isForwarded, true)
    const data = JSON.parse(Buffer.from(rich.unifiedResponse.data, 'base64').toString('utf8'))
    const prim = data.sections[0].view_model.primitive
    assert.equal(prim.__typename, 'GenAIaeacdsnwHtmlPrimitive')
    assert.deepEqual(prim.trusted_sources, [])
    assert.notEqual(data.response_id, mci.botMetadata.botResponseId)
  })
}

test('wordle: html memuat pembangun papan, keyboard, dan daftar kata bersih', async () => {
  const { readFile } = await import('node:fs/promises')
  const html = await readFile(new URL('../games/wordle/index.html', import.meta.url), 'utf8')
  for (const marker of ['buildBoard', 'buildKb', 'colorize', 'submitGuess', '__restart', "addEventListener('keydown'"]) {
    assert.ok(html.includes(marker), `wordle: penanda hilang: ${marker}`)
  }
  assert.ok(html.includes("el('board')") || html.includes('boardEl'), 'wordle: papan tidak dirujuk')
  assert.ok(html.includes('krow'), 'wordle: baris keyboard tidak dibangun')
  const pick = (name) => {
    const m = html.match(new RegExp(`var ${name}=\\('([^']+)'\\)`))
    assert.ok(m, `wordle: daftar ${name} tidak ditemukan`)
    return m[1].split(' ').filter(Boolean)
  }
  const answers = pick('ANSWERS')
  const extra = pick('EXTRA')
  assert.ok(answers.length >= 120, `wordle: jawaban hanya ${answers.length}, minimum 120`)
  const all = [...answers, ...extra]
  for (const w of all) assert.match(w, /^[a-z]{5}$/, `wordle: kata tidak valid: ${w}`)
  assert.equal(new Set(all).size, all.length, 'wordle: ada kata duplikat di daftar')
})
