import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listGames } from '../src/services/game-catalog.js'
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
